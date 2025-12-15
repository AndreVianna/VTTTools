namespace VttTools.AI.Workers;

public sealed class JobProcessingWorker(
    Channel<JobQueueItem, JobQueueItem> jobChannel,
    IServiceScopeFactory scopeFactory,
    IOptions<JobProcessingOptions> options,
    ILogger<JobProcessingWorker> logger)
    : BackgroundService {

    private readonly JobProcessingOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("AI job processing service started");

        await foreach (var queueItem in jobChannel.Reader.ReadAllAsync(stoppingToken)) {
            try {
                await ProcessJobAsync(queueItem.JobId, stoppingToken);
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

    private async Task ProcessJobAsync(Guid jobId, CancellationToken ct) {
        using var scope = scopeFactory.CreateScope();
        var jobsClient = scope.ServiceProvider.GetRequiredService<JobsServiceClient>();
        var handler = scope.ServiceProvider.GetRequiredService<BulkAssetGenerationHandler>();

        var job = await jobsClient.GetByIdAsync(jobId, ct);
        if (job is null || job.Type != BulkAssetGenerationHandler.JobTypeName || job.Status == JobStatus.Canceled) {
            logger.LogInformation("Job {JobId} is not available for processing.", jobId);
            return;
        }

        var startedAt = DateTime.UtcNow;
        var jobUpdate = new UpdateJobRequest {
            Status = job.Status,
            StartedAt = startedAt,
        };
        await jobsClient.UpdateAsync(jobId, jobUpdate, ct);

        var pendingItems = job.Items.Where(i => i.Status == JobItemStatus.Pending).ToList();

        foreach (var item in pendingItems) {
            var currentJob = await jobsClient.GetByIdAsync(jobId, ct);
            if (currentJob?.Status == JobStatus.Canceled) {
                logger.LogInformation("Job {JobId} was cancelled during processing", jobId);
                break;
            }

            await ProcessItemAsync(jobsClient, handler, job, item, ct);

            if (_options.DelayBetweenItemsMs > 0)
                await Task.Delay(_options.DelayBetweenItemsMs, ct);
        }

        var completedAt = DateTime.UtcNow;
        jobUpdate = new UpdateJobRequest {
            Status = JobStatus.Completed,
            CompletedAt = completedAt,
        };
        await jobsClient.UpdateAsync(jobId, jobUpdate, ct);
        var duration = (completedAt - startedAt).TotalMilliseconds;
        logger.LogInformation(
            "Job {JobId} completed in {Duration}ms", jobId, duration);
    }

    private async Task ProcessItemAsync(
        JobsServiceClient jobsClient,
        BulkAssetGenerationHandler handler,
        Job job,
        JobItem item,
        CancellationToken ct) {
        try {
            var startedItem = new UpdateJobRequest.Item {
                Index = item.Index,
                Status = JobItemStatus.InProgress,
                StartedAt = DateTime.UtcNow,
            };
            var jobUpdate = new UpdateJobRequest {
                Status = job.Status == JobStatus.Pending ? JobStatus.InProgress : job.Status,
                Items = [startedItem],
            };
            await jobsClient.UpdateAsync(job.Id, jobUpdate, ct);

            var context = new JobItemContext {
                JobId = job.Id,
                Index = item.Index,
                Data = item.Data,
            };

            var result = await handler.ProcessItemAsync(job.OwnerId, context, ct);

            var completedItem = new UpdateJobRequest.Item {
                Index = item.Index,
                Status = result.IsSuccessful ? JobItemStatus.Success : JobItemStatus.Failed,
                Message = result.IsSuccessful
                             ? $"PortraitId : {result.Value.PortraitId}, TokenId : {result.Value.TokenId}"
                             : string.Join(", ", result.Errors),
                CompletedAt = DateTime.UtcNow,
            };
            jobUpdate = new UpdateJobRequest { Items = [completedItem] };
            await jobsClient.UpdateAsync(job.Id, jobUpdate, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Item {ItemIndex} failed with exception", item.Index);
        }
    }
}
