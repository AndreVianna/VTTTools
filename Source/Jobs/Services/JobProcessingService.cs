namespace VttTools.Jobs.Services;

public sealed class JobProcessingService(
    Channel<Guid> jobChannel,
    IServiceScopeFactory scopeFactory,
    IEnumerable<IJobWorkHandler> handlers,
    IOptions<JobProcessingOptions> options,
    ILogger<JobProcessingService> logger)
    : BackgroundService, IJobProcessingService {

    private readonly JobProcessingOptions _options = options.Value;
    private readonly Dictionary<string, IJobWorkHandler> _handlers = handlers.ToDictionary(h => h.JobType, StringComparer.OrdinalIgnoreCase);

    public async Task QueueJobAsync(Guid jobId, CancellationToken ct = default)
        => await jobChannel.Writer.WriteAsync(jobId, ct);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("Job processing service started");

        await foreach (var jobId in jobChannel.Reader.ReadAllAsync(stoppingToken)) {
            try {
                await ProcessJobAsync(jobId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) {
                logger.LogInformation("Job processing service stopping");
                break;
            }
            catch (Exception ex) {
                logger.LogError(ex, "Error processing job {JobId}", jobId);
            }
        }

        logger.LogInformation("Job processing service stopped");
    }

    private async Task ProcessJobAsync(Guid jobId, CancellationToken ct) {
        using var scope = scopeFactory.CreateScope();
        var jobService = scope.ServiceProvider.GetRequiredService<IJobService>();
        var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<JobHub>>();

        var job = await jobService.GetJobByIdAsync(jobId, ct);
        if (job is null) {
            logger.LogWarning("Job {JobId} not found", jobId);
            return;
        }

        if (job.Status == JobStatus.Cancelled) {
            logger.LogInformation("Job {JobId} was cancelled before processing", jobId);
            return;
        }

        if (!_handlers.TryGetValue(job.Type, out var handler)) {
            logger.LogWarning("No handler registered for job type {JobType}", job.Type);
            await jobService.UpdateJobStatusAsync(jobId, new() {
                Status = JobStatus.Failed,
                CompletedAt = DateTime.UtcNow
            }, ct);
            return;
        }

        var startedAt = DateTime.UtcNow;
        await jobService.UpdateJobStatusAsync(jobId, new() {
            Status = JobStatus.InProgress,
            StartedAt = startedAt
        }, ct);

        await hubContext.SendProgressAsync(new() {
            JobId = jobId,
            Type = job.Type,
            ItemIndex = -1,
            ItemStatus = JobItemStatus.Pending,
            Message = "Job started",
            CurrentItem = 0,
            TotalItems = job.TotalItems
        }, ct);

        var pendingItems = await GetPendingItemsAsync(jobService, jobId, ct);
        var completedCount = job.CompletedItems;
        var failedCount = job.FailedItems;

        foreach (var item in pendingItems) {
            var currentJob = await jobService.GetJobByIdAsync(jobId, ct);
            if (currentJob?.Status == JobStatus.Cancelled) {
                logger.LogInformation("Job {JobId} was cancelled during processing", jobId);
                break;
            }

            var itemResult = await ProcessItemWithRetriesAsync(
                handler, jobService, hubContext, job, item, ct);

            if (itemResult.IsSuccess)
                completedCount++;
            else
                failedCount++;

            await jobService.UpdateJobCountsAsync(jobId, new() {
                CompletedItems = completedCount,
                FailedItems = failedCount
            }, ct);

            await hubContext.SendProgressAsync(new() {
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

        await jobService.UpdateJobStatusAsync(jobId, new() {
            Status = finalStatus,
            CompletedAt = completedAt,
            ActualDurationMs = actualDurationMs
        }, ct);

        await hubContext.SendProgressAsync(new() {
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
        IJobWorkHandler handler,
        IJobService jobService,
        IHubContext<JobHub> hubContext,
        JobResponse job,
        JobItemResponse item,
        CancellationToken ct) {

        await jobService.UpdateItemStatusAsync(item.ItemId, new() {
            Status = JobItemStatus.Processing,
            StartedAt = DateTime.UtcNow
        }, ct);

        await hubContext.SendProgressAsync(new() {
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

        await jobService.UpdateItemStatusAsync(item.ItemId, new() {
            Status = result.IsSuccess ? JobItemStatus.Completed : JobItemStatus.Failed,
            OutputJson = result.OutputJson,
            ErrorMessage = result.ErrorMessage,
            CompletedAt = DateTime.UtcNow
        }, ct);

        return result;
    }

    private static async Task<IReadOnlyList<JobItemResponse>> GetPendingItemsAsync(
        IJobService jobService,
        Guid jobId,
        CancellationToken ct) {
        var job = await jobService.GetJobByIdAsync(jobId, ct);
        return job?.Items.Where(i => i.Status == JobItemStatus.Pending).ToList() ?? [];
    }
}
