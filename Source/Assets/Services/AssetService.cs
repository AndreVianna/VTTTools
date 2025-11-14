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
    public async Task<Asset[]> GetAssetsAsync(Guid userId, AssetKind? kind, string? search, bool? published, string? owner, CancellationToken ct = default) {
        var assets = await assetStorage.GetAllAsync(ct);
        assets = owner switch {
            "mine" => [.. assets.Where(a => a.OwnerId == userId)],
            "public" => [.. assets.Where(a => a.IsPublic)],
            "all" => [.. assets.Where(a => a.OwnerId == userId || (a.IsPublic && a.IsPublished))],
            _ => [.. assets.Where(a => a.OwnerId == userId)],
        };

        if (kind.HasValue) {
            assets = [.. assets.Where(a => a.Kind == kind.Value)];
        }

        if (!string.IsNullOrWhiteSpace(search)) {
            var searchLower = search.ToLowerInvariant();
            assets = [.. assets.Where(a =>
                a.Name.Contains(searchLower, StringComparison.InvariantCultureIgnoreCase) ||
                a.Description.Contains(searchLower, StringComparison.InvariantCultureIgnoreCase)
            )];
        }

        if (published.HasValue) {
            assets = [.. assets.Where(a => a.IsPublished == published.Value)];
        }

        return assets;
    }

    /// <inheritdoc />
    public async Task<(Asset[] assets, int totalCount)> GetAssetsPagedAsync(Guid userId, AssetKind? kind, string? search, bool? published, string? owner, int skip, int take, CancellationToken ct = default) {
        // Get filtered assets (reuse existing logic)
        var allFilteredAssets = await GetAssetsAsync(userId, kind, search, published, owner, ct);

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

        // Load Token entities for each AssetToken
        var tokens = new List<AssetToken>();
        foreach (var assetResource in data.Tokens) {
            var resource = await mediaStorage.GetByIdAsync(assetResource.TokenId, ct);
            tokens.Add(new AssetToken {
                Token = resource!,
                IsDefault = assetResource.IsDefault
            });
        }

        var portrait = !data.PortraitId.HasValue ? null : await mediaStorage.GetByIdAsync(data.PortraitId.Value, ct);

        Asset asset = data.Kind switch {
            AssetKind.Object => new ObjectAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Tokens = tokens,
                Portrait = portrait,
                IsPublished = data.IsPublished,
                IsPublic = data.IsPublic,
                Size = data.Size,
                IsMovable = data.ObjectData!.IsMovable,
                IsOpaque = data.ObjectData!.IsOpaque,
                TriggerEffectId = data.ObjectData!.TriggerEffectId,
            },
            AssetKind.Monster => new MonsterAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Tokens = tokens,
                Portrait = portrait,
                IsPublished = data.IsPublished,
                IsPublic = data.IsPublic,
                Size = data.Size,
                StatBlockId = data.MonsterData!.StatBlockId,
                TokenStyle = data.MonsterData!.TokenStyle,
            },
            AssetKind.Character => new CharacterAsset {
                OwnerId = userId,
                Name = data.Name,
                Description = data.Description,
                Tokens = tokens,
                Portrait = portrait,
                IsPublished = data.IsPublished,
                IsPublic = data.IsPublic,
                Size = data.Size,
                StatBlockId = data.CharacterData!.StatBlockId,
                TokenStyle = data.CharacterData!.TokenStyle,
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

        var tokens = asset.Tokens.ToList();
        if (data.Tokens.IsSet) {
            tokens.Clear();
            foreach (var assetResource in data.Tokens.Value) {
                var resource = await mediaStorage.GetByIdAsync(assetResource.TokenId, ct);
                tokens.Add(new AssetToken {
                    Token = resource!,
                    IsDefault = assetResource.IsDefault
                });
            }
        }

        var portrait = data.PortraitId.IsSet
                        ? !data.PortraitId.Value.HasValue
                            ? null
                            : await mediaStorage.GetByIdAsync(data.PortraitId.Value.Value, ct)
                        : asset.Portrait;

        asset = asset switch {
            ObjectAsset obj => obj with {
                Name = data.Name.IsSet ? data.Name.Value : obj.Name,
                Description = data.Description.IsSet ? data.Description.Value : obj.Description,
                Tokens = tokens,
                Portrait = portrait,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : obj.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : obj.IsPublic,
                Size = data.Size.IsSet ? data.Size.Value : obj.Size,
                IsMovable = data.ObjectData.IsSet ? data.ObjectData.Value.IsMovable : obj.IsMovable,
                IsOpaque = data.ObjectData.IsSet ? data.ObjectData.Value.IsOpaque : obj.IsOpaque,
                TriggerEffectId = data.ObjectData.IsSet ? data.ObjectData.Value.TriggerEffectId : obj.TriggerEffectId,
            },
            MonsterAsset monster => monster with {
                Name = data.Name.IsSet ? data.Name.Value : monster.Name,
                Description = data.Description.IsSet ? data.Description.Value : monster.Description,
                Tokens = tokens,
                Portrait = portrait,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : monster.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : monster.IsPublic,
                Size = data.Size.IsSet ? data.Size.Value : monster.Size,
                StatBlockId = data.MonsterData.IsSet ? data.MonsterData.Value.StatBlockId : monster.StatBlockId,
                TokenStyle = data.MonsterData.IsSet ? data.MonsterData.Value.TokenStyle : monster.TokenStyle,
            },
            CharacterAsset character => character with {
                Name = data.Name.IsSet ? data.Name.Value : character.Name,
                Description = data.Description.IsSet ? data.Description.Value : character.Description,
                Tokens = tokens,
                Portrait = portrait,
                IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : character.IsPublished,
                IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : character.IsPublic,
                Size = data.Size.IsSet ? data.Size.Value : character.Size,
                StatBlockId = data.CharacterData.IsSet ? data.CharacterData.Value.StatBlockId : character.StatBlockId,
                TokenStyle = data.CharacterData.IsSet ? data.CharacterData.Value.TokenStyle : character.TokenStyle,
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