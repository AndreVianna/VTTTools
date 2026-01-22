namespace VttTools.AI.Workers;

public sealed class JobProcessingWorker(
    Channel<JobQueueItem> jobChannel,
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
        var jobsClient = scope.ServiceProvider.GetRequiredService<IJobsServiceClient>();
        var assetsClient = scope.ServiceProvider.GetRequiredService<IAssetsServiceClient>();
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

            await ProcessItemAsync(jobsClient, assetsClient, handler, job, item, ct);

            if (_options.DelayBetweenItemsMs > 0)
                await Task.Delay(_options.DelayBetweenItemsMs, ct);
        }

        // Final status update for all assets in job
        var finalJob = await jobsClient.GetByIdAsync(jobId, ct);
        if (finalJob is not null)
            await UpdateAssetStatusesForJobAsync(assetsClient, finalJob, ct);

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
        IJobsServiceClient jobsClient,
        IAssetsServiceClient assetsClient,
        BulkAssetGenerationHandler handler,
        Job job,
        JobItem item,
        CancellationToken ct) {
        try {
            // Update asset status to Processing when item starts
            if (item.AssetId.HasValue) {
                await assetsClient.UpdateIngestStatusAsync(item.AssetId.Value, IngestStatus.Processing, ct);
                logger.LogDebug("Updated asset {AssetId} status to Processing", item.AssetId.Value);
            }

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
                Result = result.IsSuccessful
                             ? JsonSerializer.Serialize(result.Value, JsonDefaults.Options)
                             : string.Join(", ", result.Errors),
                CompletedAt = DateTime.UtcNow,
            };
            jobUpdate = new UpdateJobRequest { Items = [completedItem] };
            await jobsClient.UpdateAsync(job.Id, jobUpdate, ct);

            // Update asset status based on all items for this asset
            if (item.AssetId.HasValue) {
                var currentJob = await jobsClient.GetByIdAsync(job.Id, ct);
                if (currentJob is not null)
                    await TryUpdateAssetStatusAsync(assetsClient, currentJob, item.AssetId.Value, ct);
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Item {ItemIndex} failed with exception", item.Index);
        }
    }

    private async Task TryUpdateAssetStatusAsync(
        IAssetsServiceClient assetsClient,
        Job job,
        Guid assetId,
        CancellationToken ct,
        int maxRetries = 3) {
        for (var attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await UpdateAssetStatusAsync(assetsClient, job, assetId, ct);
                return;
            }
            catch (Exception ex) when (attempt < maxRetries) {
                logger.LogWarning(ex, "Failed to update asset {AssetId} status (attempt {Attempt}/{MaxRetries})",
                    assetId, attempt, maxRetries);
                await Task.Delay(TimeSpan.FromSeconds(attempt), ct);
            }
            catch (Exception ex) {
                logger.LogError(ex, "Failed to update asset {AssetId} status after {MaxRetries} attempts. Asset may be stuck in Processing state.",
                    assetId, maxRetries);
            }
        }
    }

    private async Task UpdateAssetStatusAsync(
        IAssetsServiceClient assetsClient,
        Job job,
        Guid assetId,
        CancellationToken ct) {
        var assetItems = job.Items.Where(i => i.AssetId == assetId).ToList();
        if (assetItems.Count == 0) return;

        var newStatus = CalculateIngestStatus(assetItems);
        if (newStatus.HasValue) {
            var result = await assetsClient.UpdateIngestStatusAsync(assetId, newStatus.Value, ct);
            if (!result.IsSuccessful)
                throw new InvalidOperationException($"Failed to update asset status: {string.Join(", ", result.Errors.Select(e => e.Message))}");
            logger.LogDebug("Updated asset {AssetId} status to {Status}", assetId, newStatus.Value);
        }
    }

    private async Task UpdateAssetStatusesForJobAsync(
        IAssetsServiceClient assetsClient,
        Job job,
        CancellationToken ct) {
        var assetIds = job.Items
            .Where(i => i.AssetId.HasValue)
            .Select(i => i.AssetId!.Value)
            .Distinct();

        foreach (var assetId in assetIds)
            await TryUpdateAssetStatusAsync(assetsClient, job, assetId, ct);
    }

    private static IngestStatus? CalculateIngestStatus(List<JobItem> assetItems) {
        var hasAnyPending = assetItems.Any(i => i.Status is JobItemStatus.Pending or JobItemStatus.InProgress);
        if (hasAnyPending) return null; // Still processing, don't change status

        var successCount = assetItems.Count(i => i.Status == JobItemStatus.Success);
        var failedCount = assetItems.Count(i => i.Status == JobItemStatus.Failed);
        var totalCount = assetItems.Count;

        return (successCount, failedCount, totalCount) switch {
            // All succeeded → PendingReview
            _ when successCount == totalCount => IngestStatus.PendingReview,
            // All failed → Failed
            _ when failedCount == totalCount => IngestStatus.Failed,
            // Some succeeded, some failed → PartialFailure
            _ when successCount > 0 && failedCount > 0 => IngestStatus.PartialFailure,
            // Default: keep processing
            _ => null,
        };
    }
}