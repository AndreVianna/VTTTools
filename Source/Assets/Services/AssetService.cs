namespace VttTools.Assets.Services;

/// <summary>
/// Implements IAssetService using EF Core storage.
/// </summary>
public class AssetService(IAssetStorage assetStorage, IMediaStorage mediaStorage)
    : IAssetService {
    /// <inheritdoc />
    public Task<Asset[]> GetAssetsAsync(CancellationToken ct = default)
        => assetStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public async Task<Asset[]> GetAssetsAsync(Guid userId, AssetKind? kind, CreatureCategory? creatureCategory, string? search, bool? published, string? owner, CancellationToken ct = default) {
        var assets = await assetStorage.GetAllAsync(ct);

        // Apply ownership filter first
        if (owner == "mine") {
            assets = [.. assets.Where(a => a.OwnerId == userId)];
        }
        else if (owner == "public") {
            assets = [.. assets.Where(a => a.IsPublic)];
        }
        else if (owner == "all") {
            // Show user's assets + public published assets
            assets = [.. assets.Where(a => a.OwnerId == userId || (a.IsPublic && a.IsPublished))];
        }
        else {
            // Default: only user's own assets (when owner not specified)
            assets = [.. assets.Where(a => a.OwnerId == userId)];
        }

        // Filter by kind
        if (kind.HasValue) {
            assets = [.. assets.Where(a => a.Kind == kind.Value)];
        }

        // Filter by creature category (only for CreatureAssets)
        if (creatureCategory.HasValue) {
            assets = [.. assets.Where(a =>
                a is CreatureAsset creature && creature.Properties.Category == creatureCategory.Value
            )];
        }

        // Filter by search (name or description)
        if (!string.IsNullOrWhiteSpace(search)) {
            var searchLower = search.ToLowerInvariant();
            assets = [.. assets.Where(a =>
                a.Name.Contains(searchLower, StringComparison.InvariantCultureIgnoreCase) ||
                a.Description.Contains(searchLower, StringComparison.InvariantCultureIgnoreCase)
            )];
        }

        // Filter by published status
        if (published.HasValue) {
            assets = [.. assets.Where(a => a.IsPublished == published.Value)];
        }

        return assets;
    }

    /// <inheritdoc />
    public async Task<(Asset[] assets, int totalCount)> GetAssetsPagedAsync(Guid userId, AssetKind? kind, CreatureCategory? creatureCategory, string? search, bool? published, string? owner, int skip, int take, CancellationToken ct = default) {
        // Get filtered assets (reuse existing logic)
        var allFilteredAssets = await GetAssetsAsync(userId, kind, creatureCategory, search, published, owner, ct);

        // Get total count before pagination
        var totalCount = allFilteredAssets.Length;

        // Apply pagination
        var pagedAssets = allFilteredAssets.Skip(skip).Take(take).ToArray();

        return (pagedAssets, totalCount);
    }

    /// <inheritdoc />
    public Task<Asset?> GetAssetByIdAsync(Guid id, CancellationToken ct = default)
        => assetStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Asset>> CreateAssetAsync(Guid userId, CreateAssetData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        // Check for duplicate name for this owner
        var existing = await assetStorage.GetByNameAndOwnerAsync(data.Name, userId, ct);
        if (existing != null)
            return Result.Failure($"Duplicate asset name. An asset named '{data.Name}' already exists for this user.");

        // Load Resource entities for each AssetResource
        var resources = new List<AssetResource>();
        foreach (var assetResource in data.Resources) {
            var resource = await mediaStorage.GetByIdAsync(assetResource.ResourceId, ct);
            resources.Add(new AssetResource {
                ResourceId = assetResource.ResourceId,
                Resource = resource,
                Role = assetResource.Role
            });
        }

        Asset asset = data.Kind switch {
            AssetKind.Object => new ObjectAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Resources = resources,
                IsPublished = data.IsPublished,
                IsPublic = data.IsPublic,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.ObjectProps ?? new()
            },
            AssetKind.Creature => new CreatureAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Resources = resources,
                IsPublished = data.IsPublished,
                IsPublic = data.IsPublic,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.CreatureProps ?? new()
            },
            _ => throw new InvalidOperationException($"Unknown asset kind: {data.Kind}")
        };

        await assetStorage.AddAsync(asset, ct);
        return asset;
    }

    public async Task<Result<Asset>> CloneAssetAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await assetStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        if (original.OwnerId != userId || original is { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");
        var clone = original.Clone(userId);
        await assetStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Asset>> UpdateAssetAsync(Guid userId, Guid id, UpdateAssetData data, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var resources = asset.Resources.ToList();
        if (data.Resources.IsSet) {
            resources.Clear();
            foreach (var assetResource in data.Resources.Value) {
                var resource = await mediaStorage.GetByIdAsync(assetResource.ResourceId, ct);
                resources.Add(new AssetResource {
                    ResourceId = assetResource.ResourceId,
                    Resource = resource,
                    Role = assetResource.Role
                });
            }
        }

        asset = asset switch {
            ObjectAsset obj => obj with {
                Name = data.Name.IsSet ? data.Name.Value : obj.Name,
                Description = data.Description.IsSet ? data.Description.Value : obj.Description,
                Resources = resources,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : obj.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : obj.IsPublic,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.ObjectProps.IsSet ? data.ObjectProps.Value : obj.Properties
            },
            CreatureAsset creature => creature with {
                Name = data.Name.IsSet ? data.Name.Value : creature.Name,
                Description = data.Description.IsSet ? data.Description.Value : creature.Description,
                Resources = resources,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : creature.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : creature.IsPublic,
                UpdatedAt = DateTime.UtcNow,
                Properties = data.CreatureProps.IsSet ? data.CreatureProps.Value : creature.Properties
            },
            _ => throw new InvalidOperationException($"Unknown asset type: {asset.GetType()}")
        };

        await assetStorage.UpdateAsync(asset, ct);
        return asset;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteAssetAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var asset = await assetStorage.GetByIdAsync(id, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await assetStorage.DeleteAsync(id, ct);
        return Result.Success();
    }
}