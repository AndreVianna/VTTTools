namespace VttTools.AI.Services;

public sealed class AiJobProcessingService(
    Channel<Guid> jobChannel,
    IServiceScopeFactory scopeFactory,
    BulkAssetGenerationHandler handler,
    IOptions<JobProcessingOptions> options,
    ILogger<AiJobProcessingService> logger)
    : BackgroundService {

    private readonly JobProcessingOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("AI job processing service started");

        await foreach (var jobId in jobChannel.Reader.ReadAllAsync(stoppingToken)) {
            try {
                await ProcessJobAsync(jobId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) {
                logger.LogInformation("AI job processing service stopping");
                break;
            }
            catch (Exception ex) {
                logger.LogError(ex, "Error processing job {JobId}", jobId);
            }
        }

        logger.LogInformation("AI job processing service stopped");
    }

    private async Task ProcessJobAsync(Guid jobId, CancellationToken ct) {
        using var scope = scopeFactory.CreateScope();
        var jobsClient = scope.ServiceProvider.GetRequiredService<JobsServiceClient>();

        var job = await jobsClient.GetJobByIdAsync(jobId, ct);
        if (job is null) {
            logger.LogWarning("Job {JobId} not found", jobId);
            return;
        }

        if (job.Status == JobStatus.Cancelled) {
            logger.LogInformation("Job {JobId} was cancelled before processing", jobId);
            return;
        }

        if (job.Type != BulkAssetGenerationHandler.JobTypeName) {
            logger.LogWarning("Unknown job type: {JobType}", job.Type);
            await jobsClient.UpdateJobStatusAsync(jobId, new() {
                Status = JobStatus.Failed,
                CompletedAt = DateTime.UtcNow
            }, ct);
            return;
        }

        var startedAt = DateTime.UtcNow;
        await jobsClient.UpdateJobStatusAsync(jobId, new() {
            Status = JobStatus.InProgress,
            StartedAt = startedAt
        }, ct);

        await jobsClient.BroadcastProgressAsync(new() {
            JobId = jobId,
            Type = job.Type,
            ItemIndex = -1,
            ItemStatus = JobItemStatus.Pending,
            Message = "Job started",
            CurrentItem = 0,
            TotalItems = job.TotalItems
        }, ct);

        var pendingItems = await jobsClient.GetPendingItemsAsync(jobId, ct);
        var completedCount = job.CompletedItems;
        var failedCount = job.FailedItems;

        foreach (var item in pendingItems) {
            var currentJob = await jobsClient.GetJobByIdAsync(jobId, ct);
            if (currentJob?.Status == JobStatus.Cancelled) {
                logger.LogInformation("Job {JobId} was cancelled during processing", jobId);
                break;
            }

            var itemResult = await ProcessItemWithRetriesAsync(jobsClient, job, item, ct);

            if (itemResult.IsSuccess)
                completedCount++;
            else
                failedCount++;

            await jobsClient.UpdateJobCountsAsync(jobId, new() {
                CompletedItems = completedCount,
                FailedItems = failedCount
            }, ct);

            await jobsClient.BroadcastProgressAsync(new() {
                JobId = jobId,
                Type = job.Type,
                ItemIndex = item.Index,
                ItemStatus = itemResult.IsSuccess ? JobItemStatus.Completed : JobItemStatus.Failed,
                Message = $"Processed item {item.Index + 1}",
                CurrentItem = completedCount + failedCount,
                TotalItems = job.TotalItems
            }, ct);

            if (_options.DelayBetweenItemsMs > 0)
                await Task.Delay(_options.DelayBetweenItemsMs, ct);
        }

        var completedAt = DateTime.UtcNow;
        var actualDurationMs = (long)(completedAt - startedAt).TotalMilliseconds;

        var finalStatus = failedCount == 0
            ? JobStatus.Completed
            : completedCount == 0
                ? JobStatus.Failed
                : JobStatus.PartialSuccess;

        await jobsClient.UpdateJobStatusAsync(jobId, new() {
            Status = finalStatus,
            CompletedAt = completedAt,
            ActualDurationMs = actualDurationMs
        }, ct);

        await jobsClient.BroadcastProgressAsync(new() {
            JobId = jobId,
            Type = job.Type,
            ItemIndex = -1,
            ItemStatus = JobItemStatus.Completed,
            Message = $"Job completed: {finalStatus}",
            CurrentItem = completedCount + failedCount,
            TotalItems = job.TotalItems
        }, ct);

        logger.LogInformation(
            "Job {JobId} completed with status {Status}: {Completed} completed, {Failed} failed in {Duration}ms",
            jobId, finalStatus, completedCount, failedCount, actualDurationMs);
    }

    private async Task<JobItemResult> ProcessItemWithRetriesAsync(
        JobsServiceClient jobsClient,
        JobResponse job,
        JobItemResponse item,
        CancellationToken ct) {

        await jobsClient.UpdateItemStatusAsync(item.ItemId, new() {
            Status = JobItemStatus.Processing,
            StartedAt = DateTime.UtcNow
        }, ct);

        await jobsClient.BroadcastProgressAsync(new() {
            JobId = job.Id,
            Type = job.Type,
            ItemIndex = item.Index,
            ItemStatus = JobItemStatus.Processing,
            Message = $"Processing item {item.Index + 1}",
            CurrentItem = 0,
            TotalItems = job.TotalItems
        }, ct);

        var context = new JobItemContext {
            JobId = job.Id,
            ItemId = item.ItemId,
            Index = item.Index,
            JobInputJson = job.InputJson,
            ItemInputJson = item.InputJson
        };

        JobItemResult? result = null;
        var attempts = 0;

        while (attempts < _options.MaxRetries) {
            attempts++;
            try {
                result = await handler.ProcessItemAsync(null!, null!, context, ct);
                if (result.IsSuccess)
                    break;

                if (attempts < _options.MaxRetries) {
                    logger.LogWarning(
                        "Item {ItemId} failed attempt {Attempt}/{MaxRetries}: {Error}. Retrying...",
                        item.ItemId, attempts, _options.MaxRetries, result.ErrorMessage);
                    await Task.Delay(_options.RetryDelayMs, ct);
                }
            }
            catch (Exception ex) {
                result = JobItemResult.Failure(ex.Message);
                if (attempts < _options.MaxRetries) {
                    logger.LogWarning(ex,
                        "Item {ItemId} threw exception on attempt {Attempt}/{MaxRetries}. Retrying...",
                        item.ItemId, attempts, _options.MaxRetries);
                    await Task.Delay(_options.RetryDelayMs, ct);
                }
            }
        }

        result ??= JobItemResult.Failure("Processing failed after all retries");

        await jobsClient.UpdateItemStatusAsync(item.ItemId, new() {
            Status = result.IsSuccess ? JobItemStatus.Completed : JobItemStatus.Failed,
            OutputJson = result.OutputJson,
            ErrorMessage = result.ErrorMessage,
            CompletedAt = DateTime.UtcNow
        }, ct);

        return result;
    }
}
