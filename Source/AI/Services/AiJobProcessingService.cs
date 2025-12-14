namespace VttTools.AI.Services;

public sealed class AiJobProcessingService(
    Channel<JobQueueItem> jobChannel,
    IServiceScopeFactory scopeFactory,
    IOptions<JobProcessingOptions> options,
    ILogger<AiJobProcessingService> logger)
    : BackgroundService {

    private readonly JobProcessingOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("AI job processing service started");

        await foreach (var queueItem in jobChannel.Reader.ReadAllAsync(stoppingToken)) {
            try {
                await ProcessJobAsync(queueItem.JobId, queueItem.AuthToken, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) {
                logger.LogInformation("AI job processing service stopping");
                break;
            }
            catch (Exception ex) {
                logger.LogError(ex, "Error processing job {JobId}", queueItem.JobId);
            }
        }

        logger.LogInformation("AI job processing service stopped");
    }

    private async Task ProcessJobAsync(Guid jobId, string? authToken, CancellationToken ct) {
        using var scope = scopeFactory.CreateScope();
        var jobsClient = scope.ServiceProvider.GetRequiredService<JobsServiceClient>();
        var handler = scope.ServiceProvider.GetRequiredService<BulkAssetGenerationHandler>();

        var job = await jobsClient.GetJobByIdAsync(jobId, ct, authToken);
        if (job is null) {
            logger.LogWarning("Job {JobId} not found", jobId);
            return;
        }

        if (job.Status == JobStatus.Canceled) {
            logger.LogInformation("Job {JobId} was cancelled before processing", jobId);
            return;
        }

        if (job.Type != BulkAssetGenerationHandler.JobTypeName) {
            logger.LogWarning("Unknown job type: {JobType}", job.Type);
            return;
        }

        var startedAt = DateTime.UtcNow;

        await jobsClient.BroadcastProgressAsync(new() {
            JobId = jobId,
            Type = job.Type,
            ItemIndex = -1,
            ItemStatus = JobItemStatus.Pending,
            Message = "Job started",
            CurrentItem = 0,
            TotalItems = job.TotalItems
        }, ct, authToken);

        var pendingItems = await jobsClient.GetJobItemsAsync(jobId, JobItemStatus.Pending, ct, authToken);
        var processedCount = 0;

        foreach (var item in pendingItems) {
            var currentJob = await jobsClient.GetJobByIdAsync(jobId, ct, authToken);
            if (currentJob?.Status == JobStatus.Canceled) {
                logger.LogInformation("Job {JobId} was cancelled during processing", jobId);
                break;
            }

            var itemResult = await ProcessItemAsync(jobsClient, handler, job, item, authToken, ct);
            processedCount++;

            await jobsClient.BroadcastProgressAsync(new() {
                JobId = jobId,
                Type = job.Type,
                ItemIndex = item.Index,
                ItemStatus = itemResult.IsSuccess ? JobItemStatus.Success : JobItemStatus.Failed,
                Message = $"Processed item {item.Index + 1}",
                CurrentItem = processedCount,
                TotalItems = job.TotalItems
            }, ct, authToken);

            if (_options.DelayBetweenItemsMs > 0)
                await Task.Delay(_options.DelayBetweenItemsMs, ct);
        }

        var completedAt = DateTime.UtcNow;
        var actualDurationMs = (long)(completedAt - startedAt).TotalMilliseconds;

        var finalJob = await jobsClient.GetJobByIdAsync(jobId, ct, authToken);
        var finalStatus = finalJob?.Status ?? JobStatus.Failed;

        await jobsClient.BroadcastProgressAsync(new() {
            JobId = jobId,
            Type = job.Type,
            ItemIndex = -1,
            ItemStatus = JobItemStatus.Success,
            Message = $"Job completed: {finalStatus}",
            CurrentItem = job.TotalItems,
            TotalItems = job.TotalItems
        }, ct, authToken);

        logger.LogInformation(
            "Job {JobId} completed with status {Status} in {Duration}ms",
            jobId, finalStatus, actualDurationMs);
    }

    private async Task<JobItemResult> ProcessItemAsync(
        JobsServiceClient jobsClient,
        BulkAssetGenerationHandler handler,
        JobResponse job,
        JobItemResponse item,
        string? authToken,
        CancellationToken ct) {

        await jobsClient.UpdateItemStatusAsync(job.Id, item.Index, new() {
            Status = JobItemStatus.InProgress,
            StartedAt = DateTime.UtcNow
        }, ct, authToken);

        await jobsClient.BroadcastProgressAsync(new() {
            JobId = job.Id,
            Type = job.Type,
            ItemIndex = item.Index,
            ItemStatus = JobItemStatus.InProgress,
            Message = $"Processing item {item.Index + 1}",
            CurrentItem = 0,
            TotalItems = job.TotalItems
        }, ct, authToken);

        var context = new JobItemContext {
            JobId = job.Id,
            ItemId = item.ItemId,
            Index = item.Index,
            JobInputJson = job.InputJson,
            ItemInputJson = item.InputJson,
            AuthToken = authToken
        };

        JobItemResult result;
        try {
            result = await handler.ProcessItemAsync(context, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Item {ItemId} failed with exception", item.ItemId);
            result = JobItemResult.Failure(ex.Message);
        }

        await jobsClient.UpdateItemStatusAsync(job.Id, item.Index, new() {
            Status = result.IsSuccess ? JobItemStatus.Success : JobItemStatus.Failed,
            OutputJson = result.OutputJson,
            ErrorMessage = result.ErrorMessage,
            CompletedAt = DateTime.UtcNow
        }, ct, authToken);

        return result;
    }
}
