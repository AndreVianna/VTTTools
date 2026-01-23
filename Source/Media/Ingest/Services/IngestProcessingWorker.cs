using System.Text.Json;
using VttTools.Jobs.ApiContracts;
using VttTools.Json;
using VttTools.Media.Ingest.Clients;

namespace VttTools.Media.Ingest.Services;

/// <summary>
/// Background worker that processes ingest jobs by generating AI images and saving them.
/// </summary>
public sealed class IngestProcessingWorker(
    IServiceScopeFactory scopeFactory,
    IngestProcessingQueue queue,
    ILogger<IngestProcessingWorker> logger)
    : BackgroundService {

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("Ingest processing worker started");

        await foreach (var queueItem in queue.DequeueAllAsync(stoppingToken)) {
            try {
                await ProcessJobAsync(queueItem.JobId, queueItem.OwnerId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) {
                logger.LogInformation("Ingest processing worker stopping");
                break;
            }
            catch (Exception ex) {
                logger.LogError(ex, "Error processing ingest job {JobId}", queueItem.JobId);
            }
        }

        logger.LogInformation("Ingest processing worker stopped");
    }

    private async Task ProcessJobAsync(Guid jobId, Guid ownerId, CancellationToken ct) {
        using var scope = scopeFactory.CreateScope();
        var jobsClient = scope.ServiceProvider.GetRequiredService<IJobsServiceClient>();
        var aiClient = scope.ServiceProvider.GetRequiredService<IAiGenerationClient>();
        var assetsClient = scope.ServiceProvider.GetRequiredService<IAssetsServiceClient>();
        var blobStorage = scope.ServiceProvider.GetRequiredService<IBlobStorage>();
        var mediaStorage = scope.ServiceProvider.GetRequiredService<IMediaStorage>();
        var processor = scope.ServiceProvider.GetRequiredService<IMediaProcessorService>();

        var job = await jobsClient.GetByIdAsync(jobId, ct);
        if (job is null || job.Type != IngestService.JobTypeName || job.Status == JobStatus.Canceled) {
            logger.LogInformation("Job {JobId} is not available for processing", jobId);
            return;
        }

        // Mark job as started
        var startedAt = DateTime.UtcNow;
        await jobsClient.UpdateAsync(jobId, new UpdateJobRequest {
            Status = JobStatus.InProgress,
            StartedAt = startedAt,
        }, ct);

        var pendingItems = job.Items.Where(i => i.Status == JobItemStatus.Pending).ToList();

        foreach (var item in pendingItems) {
            // Check for cancellation
            var currentJob = await jobsClient.GetByIdAsync(jobId, ct);
            if (currentJob?.Status == JobStatus.Canceled) {
                logger.LogInformation("Job {JobId} was cancelled during processing", jobId);
                break;
            }

            await ProcessItemAsync(jobsClient, aiClient, assetsClient, blobStorage, mediaStorage, processor, job, item, ownerId, ct);
        }

        // Final status update for all assets in job
        var finalJob = await jobsClient.GetByIdAsync(jobId, ct);
        if (finalJob is not null)
            await UpdateAssetStatusesForJobAsync(assetsClient, finalJob, ct);

        // Mark job as completed
        await jobsClient.UpdateAsync(jobId, new UpdateJobRequest {
            Status = JobStatus.Completed,
            CompletedAt = DateTime.UtcNow,
        }, ct);

        var duration = (DateTime.UtcNow - startedAt).TotalMilliseconds;
        logger.LogInformation("Ingest job {JobId} completed in {Duration}ms", jobId, duration);
    }

    private async Task ProcessItemAsync(
        IJobsServiceClient jobsClient,
        IAiGenerationClient aiClient,
        IAssetsServiceClient assetsClient,
        IBlobStorage blobStorage,
        IMediaStorage mediaStorage,
        IMediaProcessorService processor,
        Job job,
        JobItem item,
        Guid ownerId,
        CancellationToken ct) {
        try {
            var itemData = JsonSerializer.Deserialize<IngestJobItemData>(item.Data, JsonDefaults.Options);
            if (itemData is null) {
                logger.LogError("Failed to deserialize job item data for item {Index}", item.Index);
                await MarkItemFailedAsync(jobsClient, job.Id, item.Index, "Invalid item data", ct);
                return;
            }

            // Update asset status to Processing when item starts
            await assetsClient.UpdateIngestStatusAsync(itemData.AssetId, IngestStatus.Processing, ct);
            logger.LogDebug("Updated asset {AssetId} status to Processing", itemData.AssetId);

            // Mark item as in progress
            await jobsClient.UpdateAsync(job.Id, new UpdateJobRequest {
                Status = JobStatus.InProgress,
                Items = [
                    new UpdateJobRequest.Item {
                        Index = item.Index,
                        Status = JobItemStatus.InProgress,
                        StartedAt = DateTime.UtcNow,
                    },
                ],
            }, ct);

            // Build prompt
            var prompt = BuildPrompt(itemData);

            // Determine content type
            var isPortrait = itemData.GenerationType.Equals("Portrait", StringComparison.OrdinalIgnoreCase);
            var contentType = isPortrait ? GeneratedContentType.ImagePortrait : GeneratedContentType.ImageToken;

            // Generate image via AI API
            logger.LogDebug("Generating {GenerationType} for asset {AssetId}", itemData.GenerationType, itemData.AssetId);
            var generateResult = await aiClient.GenerateImageBytesAsync(prompt, contentType, ct);

            if (!generateResult.IsSuccessful) {
                logger.LogWarning("{GenerationType} generation failed for asset {AssetId}: {Errors}",
                    itemData.GenerationType, itemData.AssetId, string.Join(", ", generateResult.Errors));
                await MarkItemFailedAsync(jobsClient, job.Id, item.Index, $"Generation failed: {string.Join(", ", generateResult.Errors)}", ct);
                return;
            }

            // Save image to blob storage
            var assetPath = GetAssetPath(itemData.AssetId);

            if (isPortrait) {
                // Save portrait to primary storage
                await using var portraitStream = new MemoryStream(generateResult.Value.ImageData);
                await blobStorage.SavePrimaryAsync(assetPath, portraitStream, "image/png", ct);

                // Generate thumbnail (256x256)
                portraitStream.Position = 0;
                var thumbnail = await processor.GenerateThumbnailAsync("image/png", portraitStream, 256, ct);
                if (thumbnail is { Length: > 0 }) {
                    await blobStorage.SaveThumbnailAsync(assetPath, thumbnail, ct);
                    logger.LogDebug("Generated thumbnail for asset {AssetId}", itemData.AssetId);
                }

                logger.LogInformation("Saved portrait and thumbnail for asset {AssetId}", itemData.AssetId);
            }
            else {
                // Token - create ResourceMetadata and save to tokens path
                var tokenIndex = await GetNextTokenIndexAsync(mediaStorage, itemData.AssetId, ct);
                var tokenPath = $"{assetPath}/{tokenIndex}";

                await using var tokenStream = new MemoryStream(generateResult.Value.ImageData);
                await SaveTokenAsync(blobStorage, tokenPath, tokenStream, "image/png", ct);

                // Create ResourceMetadata for the token
                var tokenMetadata = new ResourceMetadata {
                    Id = Guid.CreateVersion7(),
                    OwnerId = ownerId,
                    Role = ResourceRole.Token,
                    Path = tokenPath,
                    ContentType = "image/png",
                    FileName = $"{itemData.Name}_token.png",
                    FileSize = (ulong)generateResult.Value.ImageData.Length,
                    Dimensions = new VttTools.Common.Model.Size(generateResult.Value.Width, generateResult.Value.Height),
                    Name = $"{itemData.Name} Token",
                    Description = $"Generated token for {itemData.Name}",
                };
                await mediaStorage.AddAsync(tokenMetadata, ct);

                // Link token to asset
                await assetsClient.AddTokenAsync(itemData.AssetId, tokenMetadata.Id, ct);

                logger.LogInformation("Saved token {TokenId} for asset {AssetId}", tokenMetadata.Id, itemData.AssetId);
            }

            // Mark item as success
            var result = new IngestItemResult {
                AssetId = itemData.AssetId,
                GenerationType = itemData.GenerationType,
                Success = true,
            };
            await jobsClient.UpdateAsync(job.Id, new UpdateJobRequest {
                Items = [
                    new UpdateJobRequest.Item {
                        Index = item.Index,
                        Status = JobItemStatus.Success,
                        Result = JsonSerializer.Serialize(result, JsonDefaults.Options),
                        CompletedAt = DateTime.UtcNow,
                    },
                ],
            }, ct);

            // Update asset status based on all items for this asset
            var currentJob = await jobsClient.GetByIdAsync(job.Id, ct);
            if (currentJob is not null)
                await TryUpdateAssetStatusAsync(assetsClient, currentJob, itemData.AssetId, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error processing item {Index}", item.Index);
            await MarkItemFailedAsync(jobsClient, job.Id, item.Index, ex.Message, ct);
        }
    }

    private static async Task MarkItemFailedAsync(IJobsServiceClient jobsClient, Guid jobId, int itemIndex, string error, CancellationToken ct) {
        await jobsClient.UpdateAsync(jobId, new UpdateJobRequest {
            Items = [
                new UpdateJobRequest.Item {
                    Index = itemIndex,
                    Status = JobItemStatus.Failed,
                    Result = error,
                    CompletedAt = DateTime.UtcNow,
                },
            ],
        }, ct);
    }

    private static string BuildPrompt(IngestJobItemData itemData) {
        var basePrompt = $"A {itemData.Category ?? "fantasy"} {itemData.Type ?? "character"} named {itemData.Name}";

        if (!string.IsNullOrWhiteSpace(itemData.Description))
            basePrompt += $". {itemData.Description}";

        if (!string.IsNullOrWhiteSpace(itemData.Environment))
            basePrompt += $" in {itemData.Environment}";

        return basePrompt;
    }

    private static string GetAssetPath(Guid assetId) {
        var idString = assetId.ToString();
        var suffix = idString[^4..];
        return $"{suffix}/{assetId}";
    }

    private static Task<int> GetNextTokenIndexAsync(IMediaStorage mediaStorage, Guid assetId, CancellationToken ct) {
        // For now, just start at index 0 for the first token
        // In the future, we could track token counts per asset or query blob storage
        // Since each asset gets one token during ingest, this is sufficient
        _ = mediaStorage; // unused for now
        _ = assetId; // unused for now
        _ = ct; // unused for now
        return Task.FromResult(0);
    }

    private static async Task SaveTokenAsync(IBlobStorage blobStorage, string path, Stream data, string contentType, CancellationToken ct) {
        // For now, save token to primary storage location (tokens/{path})
        // This follows the plan's storage layout: tokens/{assetPath}/{index}
        await blobStorage.SavePrimaryAsync(path, data, contentType, ct);
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
                logger.LogError(ex, "Failed to update asset {AssetId} status after {MaxRetries} attempts",
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
            // All succeeded -> PendingReview
            _ when successCount == totalCount => IngestStatus.PendingReview,
            // All failed -> Failed
            _ when failedCount == totalCount => IngestStatus.Failed,
            // Some succeeded, some failed -> PartialFailure
            _ when successCount > 0 && failedCount > 0 => IngestStatus.PartialFailure,
            // Default: keep processing
            _ => null,
        };
    }
}

/// <summary>
/// Result of processing an ingest item.
/// </summary>
internal sealed record IngestItemResult {
    public required Guid AssetId { get; init; }
    public required string GenerationType { get; init; }
    public bool Success { get; init; }
    public Guid? ResourceId { get; init; }
}
