using VttTools.Admin.Resources.Clients;
using AssetModel = VttTools.Assets.Model.Asset;
using MediaIngestRequest = VttTools.Media.Ingest.StartIngestRequest;
using MediaIngestItemRequest = VttTools.Media.Ingest.IngestItemRequest;

namespace VttTools.Admin.Ingest.Services;

public sealed class AssetIngestService(
    IOptions<PublicLibraryOptions> options,
    IAssetStorage assetStorage,
    IMediaServiceClient mediaServiceClient,
    ILogger<AssetIngestService> logger)
    : IAssetIngestService {

    private Guid MasterUserId => options.Value.MasterUserId;

    public async Task<Result<IngestJobResponse>> IngestAssetsAsync(IngestAssetsRequest request, CancellationToken ct = default) {
        try {
            if (request.Items.Count == 0)
                return Result.Failure("At least one item is required.").WithNo<IngestJobResponse>();

            var assets = new List<AssetModel>();
            var ingestItems = new List<MediaIngestItemRequest>();

            foreach (var item in request.Items) {
                var asset = CreateDraftAsset(item);
                assets.Add(asset);

                ingestItems.Add(new MediaIngestItemRequest {
                    AssetId = asset.Id,
                    Name = item.Name,
                    Kind = item.Kind,
                    Category = item.Category,
                    Type = item.Type,
                    Subtype = item.Subtype,
                    Environment = item.Environment,
                    Description = item.Description,
                    Tags = item.Tags,
                    GeneratePortrait = true,
                    GenerateToken = true,
                });
            }

            foreach (var asset in assets) {
                await assetStorage.AddAsync(asset, ct);
            }

            logger.LogInformation("Created {Count} draft assets for ingest", assets.Count);

            var ingestRequest = new MediaIngestRequest {
                Items = ingestItems,
            };

            var jobResult = await mediaServiceClient.StartIngestAsync(MasterUserId, ingestRequest, ct);
            if (!jobResult.IsSuccessful) {
                logger.LogError("Failed to start ingest job: {Errors}", string.Join(", ", jobResult.Errors.Select(e => e.Message)));
                return Result.Failure("Failed to start ingest job").WithNo<IngestJobResponse>();
            }

            logger.LogInformation("Started ingest job {JobId} with {ItemCount} items for {AssetCount} assets",
                jobResult.Value.JobId, jobResult.Value.ItemCount, assets.Count);

            return ToAdminResponse(jobResult.Value);
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
            var ingestItems = new List<MediaIngestItemRequest>();

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
                    Tokens = [],
                };
                await assetStorage.UpdateAsync(updated, ct);
                assets.Add(updated);

                ingestItems.Add(new MediaIngestItemRequest {
                    AssetId = asset.Id,
                    Name = asset.Name,
                    Kind = asset.Classification.Kind,
                    Category = asset.Classification.Category,
                    Type = asset.Classification.Type,
                    Subtype = asset.Classification.Subtype,
                    Description = item.AiPrompt,
                    Tags = asset.Tags,
                    GeneratePortrait = true,
                    GenerateToken = true,
                });
            }

            if (assets.Count == 0)
                return Result.Failure("No valid assets found to reject").WithNo<IngestJobResponse>();

            var ingestRequest = new MediaIngestRequest {
                Items = ingestItems,
            };

            var jobResult = await mediaServiceClient.StartIngestAsync(MasterUserId, ingestRequest, ct);
            if (!jobResult.IsSuccessful)
                return Result.Failure("Failed to start regeneration job").WithNo<IngestJobResponse>();

            logger.LogInformation("Started regeneration job {JobId} for {Count} rejected assets", jobResult.Value.JobId, assets.Count);

            return ToAdminResponse(jobResult.Value);
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
            var assets = new List<AssetModel>();
            var ingestItems = new List<MediaIngestItemRequest>();

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

                // For failed/partial failure assets, regenerate based on tokens
                // Portrait existence is determined by blob storage (derived from asset path)
                var needsToken = asset.Tokens.Count == 0;
                var needsPortrait = needsToken; // If no token, assume portrait also needs regeneration

                if (!needsPortrait && !needsToken) {
                    logger.LogWarning("Asset {AssetId} has all resources", assetId);
                    continue;
                }

                var updated = asset with {
                    IngestStatus = IngestStatus.Processing,
                };
                await assetStorage.UpdateAsync(updated, ct);
                assets.Add(updated);

                // Use per-item flags to only regenerate what's needed
                ingestItems.Add(new MediaIngestItemRequest {
                    AssetId = asset.Id,
                    Name = asset.Name,
                    Kind = asset.Classification.Kind,
                    Category = asset.Classification.Category,
                    Type = asset.Classification.Type,
                    Subtype = asset.Classification.Subtype,
                    Description = asset.AiPrompt ?? asset.Description,
                    Tags = asset.Tags,
                    GeneratePortrait = needsPortrait,
                    GenerateToken = needsToken,
                });
            }

            if (assets.Count == 0)
                return Result.Failure("No valid assets found to retry").WithNo<IngestJobResponse>();

            var ingestRequest = new MediaIngestRequest {
                Items = ingestItems,
            };

            var jobResult = await mediaServiceClient.StartIngestAsync(MasterUserId, ingestRequest, ct);
            if (!jobResult.IsSuccessful)
                return Result.Failure("Failed to start retry job").WithNo<IngestJobResponse>();

            logger.LogInformation("Started retry job {JobId} for {Count} failed assets", jobResult.Value.JobId, assets.Count);

            return ToAdminResponse(jobResult.Value);
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

    private async Task DeleteAssetResourcesAsync(AssetModel asset, CancellationToken ct) {
        // Note: Portraits are stored in blob storage at derived paths (resources/{suffix}/{assetId})
        // They will be overwritten during regeneration, no explicit deletion needed

        // Delete tokens (tokens have ResourceMetadata records)
        foreach (var token in asset.Tokens) {
            var result = await mediaServiceClient.DeleteResourceAsync(token.Id, ct);
            if (!result.IsSuccessful)
                logger.LogWarning("Failed to delete token {ResourceId} for asset {AssetId}", token.Id, asset.Id);
        }
    }

    private static IngestAssetResponse MapToResponse(AssetModel asset) {
        // Portrait path is derived from asset ID: {suffix}/{assetId}
        var assetIdString = asset.Id.ToString();
        var suffix = assetIdString[^4..];
        var portraitPath = $"{suffix}/{asset.Id}";

        return new IngestAssetResponse {
            Id = asset.Id,
            Name = asset.Name,
            Description = asset.Description,
            Kind = asset.Classification.Kind,
            Category = asset.Classification.Category,
            Type = asset.Classification.Type,
            Subtype = asset.Classification.Subtype,
            IngestStatus = asset.IngestStatus,
            AiPrompt = asset.AiPrompt,
            // Portrait info is derived from blob storage path
            // Existence is checked via the GET /api/assets/{id}/portrait endpoint
            Portrait = asset.IngestStatus is IngestStatus.PendingReview or IngestStatus.Approved
                ? new IngestResourceInfo {
                    Id = asset.Id, // Use asset ID as portrait identifier
                    Path = portraitPath,
                    FileName = $"{asset.Name}_portrait.png",
                    ContentType = "image/png",
                }
                : null,
            Tokens = asset.Tokens.Select(t => new IngestResourceInfo {
                Id = t.Id,
                Path = t.Path,
                FileName = t.FileName,
                ContentType = t.ContentType,
            }).ToList(),
        };
    }

    private static IngestJobResponse ToAdminResponse(VttTools.Media.Ingest.IngestJobResponse mediaResponse) => new() {
        JobId = mediaResponse.JobId,
        ItemCount = mediaResponse.ItemCount,
        AssetIds = mediaResponse.AssetIds,
    };
}
