using AssetClassification = VttTools.Assets.Model.AssetClassification;
using AssetKind = VttTools.Assets.Model.AssetKind;

namespace VttTools.Admin.Services;

public sealed class AssetAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger<AssetAdminService> logger)
    : LibraryAdminService(options, dbContext, userManager, logger), IAssetAdminService {

    public async Task<LibraryContentSearchResponse> SearchAssetsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = DbContext.Assets.AsQueryable();

            query = ApplySearchFilters(
                query,
                request,
                MasterUserId,
                a => a.Name,
                a => a.Description,
                a => a.OwnerId,
                a => a.IsPublished,
                a => a.IsPublic);

            if (!string.IsNullOrWhiteSpace(request.Kind) && Enum.TryParse<AssetKind>(request.Kind, ignoreCase: true, out var kind)) {
                query = query.Where(a => a.Kind == kind);
            }

            if (!string.IsNullOrWhiteSpace(request.Category)) {
                query = query.Where(a => a.Category == request.Category);
            }

            if (!string.IsNullOrWhiteSpace(request.Type)) {
                query = query.Where(a => a.Type == request.Type);
            }

            if (!string.IsNullOrWhiteSpace(request.Subtype)) {
                query = query.Where(a => a.Subtype == request.Subtype);
            }

            var totalCount = await query.CountAsync(ct);

            var (skip, take) = GetPagination(request);

            query = ApplySorting(query, request, a => a.Name);

            var assets = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = assets.Count > take;
            if (hasMore) {
                assets = [.. assets.Take(take)];
            }

            var owners = await GetOwnerDictionaryAsync(assets.Select(a => a.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var asset in assets) {
                var ownerName = owners.GetValueOrDefault(asset.OwnerId);
                content.Add(MapToContentResponse(asset, ownerName));
            }

            Logger.LogInformation(
                "Asset search completed: {Count} assets found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching assets");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetAssetByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var asset = await DbContext.Assets.FindAsync([id], ct);
            if (asset is null)
                return null;

            var ownerName = await GetOwnerNameAsync(asset.OwnerId);
            return MapToContentResponse(asset, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving asset {AssetId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateAssetAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));

            var asset = new Asset {
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            DbContext.Assets.Add(asset);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Created asset {AssetId} with name '{Name}'", asset.Id, asset.Name);

            var ownerName = await GetOwnerNameAsync(asset.OwnerId);
            return MapToContentResponse(asset, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating asset with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateAssetAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var asset = await DbContext.Assets.FindAsync([id], ct) ?? throw new InvalidOperationException($"Asset with ID {id} not found");

            if (name is not null) {
                asset.Name = name;
            }

            if (description is not null) {
                asset.Description = description;
            }

            if (isPublished.HasValue) {
                asset.IsPublished = isPublished.Value;
            }

            if (isPublic.HasValue) {
                asset.IsPublic = isPublic.Value;
            }

            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Updated asset {AssetId}", id);

            var ownerName = await GetOwnerNameAsync(asset.OwnerId);
            return MapToContentResponse(asset, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating asset {AssetId}", id);
            throw;
        }
    }

    public async Task DeleteAssetAsync(Guid id, CancellationToken ct = default) {
        try {
            var asset = await DbContext.Assets.FindAsync([id], ct);
            if (asset is null) {
                Logger.LogWarning("Attempted to delete non-existent asset {AssetId}", id);
                return;
            }

            DbContext.Assets.Remove(asset);
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation("Deleted asset {AssetId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting asset {AssetId}", id);
            throw;
        }
    }

    public async Task TransferAssetOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var asset = await DbContext.Assets.FindAsync([id], ct) ?? throw new InvalidOperationException($"Asset with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            asset.OwnerId = newOwnerId;
            await DbContext.SaveChangesAsync(ct);

            Logger.LogInformation(
                "Transferred asset {AssetId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of asset {AssetId}", id);
            throw;
        }
    }

    public async Task<IReadOnlyList<AssetTaxonomyNode>> GetAssetTaxonomyAsync(CancellationToken ct = default) {
        try {
            var classifications = await DbContext.Assets
                .Select(a => new AssetClassification(
                    a.Kind,
                    a.Category,
                    a.Type,
                    a.Subtype))
                .ToListAsync(ct);

            var tree = BuildTaxonomyTree(classifications);

            Logger.LogInformation("Asset taxonomy retrieved with {KindCount} kinds", tree.Count);

            return tree;
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving asset taxonomy");
            throw;
        }
    }

    private static IReadOnlyList<AssetTaxonomyNode> BuildTaxonomyTree(List<AssetClassification> classifications) {
        var kindCounts = new Dictionary<string, int>();
        var kindCategoryMap = new Dictionary<string, Dictionary<string, Dictionary<string, Dictionary<string, int>>>>();

        foreach (var c in classifications) {
            var kindKey = c.Kind.ToString();

            kindCounts[kindKey] = kindCounts.GetValueOrDefault(kindKey) + 1;

            if (!kindCategoryMap.TryGetValue(kindKey, out var categoryMap)) {
                categoryMap = [];
                kindCategoryMap[kindKey] = categoryMap;
            }

            if (string.IsNullOrEmpty(c.Category))
                continue;

            if (!categoryMap.TryGetValue(c.Category, out var typeMap)) {
                typeMap = [];
                categoryMap[c.Category] = typeMap;
            }

            if (string.IsNullOrEmpty(c.Type))
                continue;

            if (!typeMap.TryGetValue(c.Type, out var subtypeMap)) {
                subtypeMap = [];
                typeMap[c.Type] = subtypeMap;
            }

            var subtypeKey = c.Subtype ?? "";
            subtypeMap[subtypeKey] = subtypeMap.GetValueOrDefault(subtypeKey) + 1;
        }

        var tree = new List<AssetTaxonomyNode>();

        foreach (var (kind, kindCount) in kindCounts) {
            var kindChildren = new List<AssetTaxonomyNode>();

            if (kindCategoryMap.TryGetValue(kind, out var categoryMap)) {
                foreach (var (category, typeMap) in categoryMap) {
                    var categoryChildren = new List<AssetTaxonomyNode>();
                    var categoryCount = 0;

                    foreach (var (type, subtypeMap) in typeMap) {
                        var typeChildren = new List<AssetTaxonomyNode>();
                        var typeCount = subtypeMap.Values.Sum();

                        foreach (var (subtype, count) in subtypeMap) {
                            if (!string.IsNullOrEmpty(subtype)) {
                                typeChildren.Add(new AssetTaxonomyNode(
                                    $"{kind}/{category}/{type}/{subtype}",
                                    subtype,
                                    count,
                                    [kind, category, type, subtype],
                                    []));
                            }
                        }

                        categoryChildren.Add(new AssetTaxonomyNode(
                            $"{kind}/{category}/{type}",
                            type,
                            typeCount,
                            [kind, category, type],
                            typeChildren));

                        categoryCount += typeCount;
                    }

                    kindChildren.Add(new AssetTaxonomyNode(
                        $"{kind}/{category}",
                        category,
                        categoryCount,
                        [kind, category],
                        categoryChildren));
                }
            }

            tree.Add(new AssetTaxonomyNode(
                kind,
                kind,
                kindCount,
                [kind],
                kindChildren));
        }

        return tree;
    }

    private static LibraryContentResponse MapToContentResponse(Asset asset, string? ownerName) => new() {
        Id = asset.Id,
        OwnerId = asset.OwnerId,
        OwnerName = ownerName,
        Name = asset.Name,
        Description = asset.Description,
        IsPublished = asset.IsPublished,
        IsPublic = asset.IsPublic,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = null
    };
}