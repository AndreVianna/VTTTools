using System.Text.Json;
using VttTools.Admin.Resources.Clients;
using AssetModel = VttTools.Assets.Model.Asset;

namespace VttTools.Admin.Ingest.Services;

public sealed class AssetIngestService(
    IOptions<PublicLibraryOptions> options,
    IAssetStorage assetStorage,
    IJobStorage jobStorage,
    IAiServiceClient aiServiceClient,
    IMediaServiceClient mediaServiceClient,
    ILogger<AssetIngestService> logger)
    : IAssetIngestService {

    private Guid MasterUserId => options.Value.MasterUserId;

    public async Task<Result<IngestJobResponse>> IngestAssetsAsync(IngestAssetsRequest request, CancellationToken ct = default) {
        try {
            if (request.Items.Count == 0)
                return Result.Failure("At least one item is required.").WithNo<IngestJobResponse>();

            var assets = new List<AssetModel>();
            var jobItems = new List<BulkAssetGenerationListItem>();

            foreach (var item in request.Items) {
                var asset = CreateDraftAsset(item);
                assets.Add(asset);

                jobItems.Add(new BulkAssetGenerationListItem {
                    Name = item.Name,
                    Kind = item.Kind,
                    Category = item.Category,
                    Type = item.Type,
                    Subtype = item.Subtype,
                    Size = item.Size,
                    Environment = item.Environment,
                    Description = item.Description,
                    Tags = item.Tags,
                });
            }

            foreach (var asset in assets) {
                await assetStorage.AddAsync(asset, ct);
            }

            logger.LogInformation("Created {Count} draft assets for ingest", assets.Count);

            var bulkRequest = new BulkAssetGenerationRequest {
                GeneratePortrait = true,
                GenerateToken = true,
                Items = jobItems,
            };

            var jobResult = await aiServiceClient.StartBulkGenerationAsync(MasterUserId, bulkRequest, ct);
            if (jobResult is null) {
                logger.LogError("Failed to start AI generation job");
                return Result.Failure("Failed to start AI generation job").WithNo<IngestJobResponse>();
            }

            await LinkJobItemsToAssetsAsync(jobResult.Id, assets, ct);

            logger.LogInformation("Started ingest job {JobId} with {ItemCount} items for {AssetCount} assets",
                jobResult.Id, jobResult.Items.Count, assets.Count);

            return new IngestJobResponse {
                JobId = jobResult.Id,
                ItemCount = jobResult.Items.Count,
                AssetIds = assets.Select(a => a.Id).ToList(),
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error ingesting assets");
            return Result.Failure(ex.Message).WithNo<IngestJobResponse>();
        }
    }

    public async Task<Result<IngestBatchResponse>> ApproveAssetsAsync(ApproveAssetsRequest request, CancellationToken ct = default) {
        try {
            var succeeded = new List<Guid>();
            var failed = new List<IngestBatchFailure>();

            foreach (var assetId in request.AssetIds) {
                var asset = await assetStorage.FindByIdAsync(MasterUserId, assetId, ct);
                if (asset is null) {
                    logger.LogWarning("Asset {AssetId} not found for approval", assetId);
                    failed.Add(new IngestBatchFailure { AssetId = assetId, Reason = "Asset not found" });
                    continue;
                }

                if (asset.IngestStatus != IngestStatus.PendingReview) {
                    logger.LogWarning("Asset {AssetId} is not in PendingReview status", assetId);
                    failed.Add(new IngestBatchFailure { AssetId = assetId, Reason = $"Invalid status: {asset.IngestStatus}" });
                    continue;
                }

                var updated = asset with {
                    IngestStatus = IngestStatus.Approved,
                    IsPublished = true,
                };
                await assetStorage.UpdateAsync(updated, ct);
                succeeded.Add(assetId);
            }

            logger.LogInformation("Approved {SuccessCount}/{TotalCount} assets", succeeded.Count, request.AssetIds.Count);

            return new IngestBatchResponse {
                SucceededIds = succeeded,
                Failures = failed,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error approving assets");
            return Result.Failure(ex.Message).WithNo<IngestBatchResponse>();
        }
    }

    public async Task<Result<IngestJobResponse>> RejectAssetsAsync(RejectAssetsRequest request, CancellationToken ct = default) {
        try {
            var assets = new List<AssetModel>();
            var jobItems = new List<BulkAssetGenerationListItem>();

            foreach (var item in request.Items) {
                var asset = await assetStorage.FindByIdAsync(MasterUserId, item.AssetId, ct);
                if (asset is null) {
                    logger.LogWarning("Asset {AssetId} not found for rejection", item.AssetId);
                    continue;
                }

                if (asset.IngestStatus != IngestStatus.PendingReview) {
                    logger.LogWarning("Asset {AssetId} is not in PendingReview status", item.AssetId);
                    continue;
                }

                // Delete existing resources from blob storage
                await DeleteAssetResourcesAsync(asset, ct);

                var updated = asset with {
                    IngestStatus = IngestStatus.Pending,
                    AiPrompt = item.AiPrompt,
                    Portrait = null,
                    Tokens = [],
                };
                await assetStorage.UpdateAsync(updated, ct);
                assets.Add(updated);

                jobItems.Add(new BulkAssetGenerationListItem {
                    Name = asset.Name,
                    Kind = asset.Classification.Kind,
                    Category = asset.Classification.Category,
                    Type = asset.Classification.Type,
                    Subtype = asset.Classification.Subtype,
                    Size = asset.Size.Name.ToString().ToLowerInvariant(),
                    Description = item.AiPrompt,
                    Tags = asset.Tags,
                });
            }

            if (assets.Count == 0)
                return Result.Failure("No valid assets found to reject").WithNo<IngestJobResponse>();

            var bulkRequest = new BulkAssetGenerationRequest {
                GeneratePortrait = true,
                GenerateToken = true,
                Items = jobItems,
            };

            var jobResult = await aiServiceClient.StartBulkGenerationAsync(MasterUserId, bulkRequest, ct);
            if (jobResult is null)
                return Result.Failure("Failed to start regeneration job").WithNo<IngestJobResponse>();

            await LinkJobItemsToAssetsAsync(jobResult.Id, assets, ct);

            logger.LogInformation("Started regeneration job {JobId} for {Count} rejected assets", jobResult.Id, assets.Count);

            return new IngestJobResponse {
                JobId = jobResult.Id,
                ItemCount = jobResult.Items.Count,
                AssetIds = assets.Select(a => a.Id).ToList(),
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error rejecting assets");
            return Result.Failure(ex.Message).WithNo<IngestJobResponse>();
        }
    }

    public async Task<Result<IngestBatchResponse>> DiscardAssetsAsync(DiscardAssetsRequest request, CancellationToken ct = default) {
        try {
            var succeeded = new List<Guid>();
            var failed = new List<IngestBatchFailure>();

            foreach (var assetId in request.AssetIds) {
                var asset = await assetStorage.FindByIdAsync(MasterUserId, assetId, ct);
                if (asset is null) {
                    logger.LogWarning("Asset {AssetId} not found for discard", assetId);
                    failed.Add(new IngestBatchFailure { AssetId = assetId, Reason = "Asset not found" });
                    continue;
                }

                // Delete resources from blob storage
                await DeleteAssetResourcesAsync(asset, ct);

                var updated = asset with {
                    IngestStatus = IngestStatus.Discarded,
                    IsDeleted = true,
                    Portrait = null,
                    Tokens = [],
                };
                await assetStorage.UpdateAsync(updated, ct);
                succeeded.Add(assetId);
            }

            logger.LogInformation("Discarded {SuccessCount}/{TotalCount} assets", succeeded.Count, request.AssetIds.Count);

            return new IngestBatchResponse {
                SucceededIds = succeeded,
                Failures = failed,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error discarding assets");
            return Result.Failure(ex.Message).WithNo<IngestBatchResponse>();
        }
    }

    public async Task<Result<IngestJobResponse>> RetryFailedAsync(RetryFailedRequest request, CancellationToken ct = default) {
        try {
            var assetsWithFlags = new List<(AssetModel Asset, bool NeedsPortrait, bool NeedsToken)>();
            var jobItems = new List<BulkAssetGenerationListItem>();

            foreach (var assetId in request.AssetIds) {
                var asset = await assetStorage.FindByIdAsync(MasterUserId, assetId, ct);
                if (asset is null) {
                    logger.LogWarning("Asset {AssetId} not found for retry", assetId);
                    continue;
                }

                if (asset.IngestStatus != IngestStatus.Failed && asset.IngestStatus != IngestStatus.PartialFailure) {
                    logger.LogWarning("Asset {AssetId} is not in Failed or PartialFailure status", assetId);
                    continue;
                }

                var needsPortrait = asset.Portrait is null;
                var needsToken = asset.Tokens.Count == 0;

                if (!needsPortrait && !needsToken) {
                    logger.LogWarning("Asset {AssetId} has all resources", assetId);
                    continue;
                }

                var updated = asset with {
                    IngestStatus = IngestStatus.Processing,
                };
                await assetStorage.UpdateAsync(updated, ct);
                assetsWithFlags.Add((updated, needsPortrait, needsToken));

                // Use per-item flags to only regenerate what's needed
                jobItems.Add(new BulkAssetGenerationListItem {
                    Name = asset.Name,
                    Kind = asset.Classification.Kind,
                    Category = asset.Classification.Category,
                    Type = asset.Classification.Type,
                    Subtype = asset.Classification.Subtype,
                    Size = asset.Size.Name.ToString().ToLowerInvariant(),
                    Description = asset.AiPrompt ?? asset.Description,
                    Tags = asset.Tags,
                    GeneratePortrait = needsPortrait,
                    GenerateToken = needsToken,
                });
            }

            if (assetsWithFlags.Count == 0)
                return Result.Failure("No valid assets found to retry").WithNo<IngestJobResponse>();

            var bulkRequest = new BulkAssetGenerationRequest {
                GeneratePortrait = true, // Allow per-item overrides
                GenerateToken = true,
                Items = jobItems,
            };

            var jobResult = await aiServiceClient.StartBulkGenerationAsync(MasterUserId, bulkRequest, ct);
            if (jobResult is null)
                return Result.Failure("Failed to start retry job").WithNo<IngestJobResponse>();

            var assets = assetsWithFlags.Select(x => x.Asset).ToList();
            await LinkJobItemsToAssetsAsync(jobResult.Id, assets, ct);

            logger.LogInformation("Started retry job {JobId} for {Count} failed assets", jobResult.Id, assets.Count);

            return new IngestJobResponse {
                JobId = jobResult.Id,
                ItemCount = jobResult.Items.Count,
                AssetIds = assets.Select(a => a.Id).ToList(),
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrying failed assets");
            return Result.Failure(ex.Message).WithNo<IngestJobResponse>();
        }
    }

    public async Task<IngestAssetListResponse> GetProcessingAssetsAsync(int skip, int take, CancellationToken ct = default) {
        var statuses = new[] {
            IngestStatus.Pending,
            IngestStatus.Processing,
            IngestStatus.PartialFailure,
            IngestStatus.Failed,
        };
        return await GetAssetsByStatusAsync(statuses, skip, take, ct);
    }

    public async Task<IngestAssetListResponse> GetReviewAssetsAsync(int skip, int take, CancellationToken ct = default) {
        var statuses = new[] { IngestStatus.PendingReview };
        return await GetAssetsByStatusAsync(statuses, skip, take, ct);
    }

    public async Task<IngestAssetListResponse> GetHistoryAssetsAsync(int skip, int take, CancellationToken ct = default) {
        var statuses = new[] { IngestStatus.Approved, IngestStatus.Discarded };
        return await GetAssetsByStatusAsync(statuses, skip, take, ct);
    }

    private AssetModel CreateDraftAsset(IngestAssetItem item) => new() {
        Id = Guid.CreateVersion7(),
        OwnerId = MasterUserId,
        Name = item.Name,
        Description = item.Description,
        Classification = new AssetClassification(item.Kind, item.Category, item.Type, item.Subtype),
        Size = new NamedSize(Enum.TryParse<SizeName>(item.Size, ignoreCase: true, out var sizeName) ? sizeName : SizeName.Medium),
        Tags = item.Tags,
        IngestStatus = IngestStatus.Pending,
        IsPublished = false,
        IsPublic = false,
    };

    private async Task<IngestAssetListResponse> GetAssetsByStatusAsync(IngestStatus[] statuses, int skip, int take, CancellationToken ct) {
        var (assets, totalCount) = await assetStorage.SearchByIngestStatusAsync(MasterUserId, statuses, skip, take + 1, ct);

        var hasMore = assets.Length > take;
        if (hasMore)
            assets = [.. assets.Take(take)];

        var items = assets.Select(MapToResponse).ToList();

        return new IngestAssetListResponse {
            Items = items,
            TotalCount = totalCount,
            HasMore = hasMore,
        };
    }

    private async Task LinkJobItemsToAssetsAsync(Guid jobId, List<AssetModel> assets, CancellationToken ct) {
        var job = await jobStorage.GetByIdAsync(jobId, ct);
        if (job is null) {
            logger.LogWarning("Job {JobId} not found for linking", jobId);
            return;
        }

        var itemIndex = 0;
        foreach (var asset in assets) {
            if (itemIndex < job.Items.Count) {
                var portraitItem = job.Items[itemIndex] with { AssetId = asset.Id };
                job.Items[itemIndex] = portraitItem;
                itemIndex++;
            }
            if (itemIndex < job.Items.Count) {
                var tokenItem = job.Items[itemIndex] with { AssetId = asset.Id };
                job.Items[itemIndex] = tokenItem;
                itemIndex++;
            }
        }

        await jobStorage.UpdateAsync(job, ct);
        logger.LogDebug("Linked job items to {Count} assets", assets.Count);
    }

    private async Task DeleteAssetResourcesAsync(AssetModel asset, CancellationToken ct) {
        // Delete portrait
        if (asset.Portrait is not null) {
            var result = await mediaServiceClient.DeleteResourceAsync(asset.Portrait.Id, ct);
            if (!result.IsSuccessful)
                logger.LogWarning("Failed to delete portrait {ResourceId} for asset {AssetId}", asset.Portrait.Id, asset.Id);
        }

        // Delete tokens
        foreach (var token in asset.Tokens) {
            var result = await mediaServiceClient.DeleteResourceAsync(token.Id, ct);
            if (!result.IsSuccessful)
                logger.LogWarning("Failed to delete token {ResourceId} for asset {AssetId}", token.Id, asset.Id);
        }
    }

    private static IngestAssetResponse MapToResponse(AssetModel asset) => new() {
        Id = asset.Id,
        Name = asset.Name,
        Description = asset.Description,
        Kind = asset.Classification.Kind,
        Category = asset.Classification.Category,
        Type = asset.Classification.Type,
        Subtype = asset.Classification.Subtype,
        IngestStatus = asset.IngestStatus,
        AiPrompt = asset.AiPrompt,
        Portrait = asset.Portrait is not null ? new IngestResourceInfo {
            Id = asset.Portrait.Id,
            Path = asset.Portrait.Path,
            FileName = asset.Portrait.FileName,
            ContentType = asset.Portrait.ContentType,
        } : null,
        Tokens = asset.Tokens.Select(t => new IngestResourceInfo {
            Id = t.Id,
            Path = t.Path,
            FileName = t.FileName,
            ContentType = t.ContentType,
        }).ToList(),
    };
}
