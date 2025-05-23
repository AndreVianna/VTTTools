using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneEntity = VttTools.Data.Library.Entities.Scene;
using SceneAsset = VttTools.Library.Scenes.Model.SceneAsset;
using SceneAssetEntity = VttTools.Data.Library.Entities.SceneAsset;
using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Scene entities.
/// </summary>
public class SceneStorage(ApplicationDbContext context)
    : ISceneStorage {
    /// <inheritdoc />
    public Task<Scene[]> GetAllAsync(CancellationToken ct = default)
        => context.Scenes
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
#pragma warning disable RCS1077
                  .Select(s => new Scene {
                      Id = s.Id,
                      Name = s.Name,
                      Description = s.Description,
                      Stage = s.Stage,
                      SceneAssets = s.SceneAssets.Select(sa => new SceneAsset {
                          Number = sa.Number,
                          Name = sa.Name,
                          Position = sa.Position,
                          Scale = sa.Scale,
                          Shape = sa.Asset.Shape,
                          IsLocked = sa.IsLocked,
                          ControlledBy = sa.ControlledBy,
                      }).ToList(),
#pragma warning restore RCS1077
                  })
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Scene[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default)
        => context.Scenes
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Where(e => e.AdventureId == adventureId)
                  .AsNoTrackingWithIdentityResolution()
#pragma warning disable RCS1077
                  .Select(s => new Scene {
                      Id = s.Id,
                      Name = s.Name,
                      Description = s.Description,
                      Stage = s.Stage,
                      SceneAssets = s.SceneAssets.Select(sa => new SceneAsset {
                          Id = sa.Asset.Id,
                          Description = sa.Asset.Description,
                          Type = sa.Asset.Type,
                          Number = sa.Number,
                          Name = sa.Name,
                          Position = sa.Position,
                          Scale = sa.Scale,
                          Shape = sa.Asset.Shape,
                          IsLocked = sa.IsLocked,
                          ControlledBy = sa.ControlledBy,
                      }).ToList(),
#pragma warning restore RCS1077
                  })
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public async Task<Scene?> GetByIdAsync(Guid id, CancellationToken ct = default) { 
        var entity = await context.Scenes
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
#pragma warning disable RCS1077
                  .Select(s => new Scene {
                      Id = s.Id,
                      Name = s.Name,
                      Description = s.Description,
                      Stage = s.Stage,
                      SceneAssets = s.SceneAssets.Select(sa => new SceneAsset {
                          Id = sa.Asset.Id,
                          Description = sa.Asset.Description,
                          Type = sa.Asset.Type,
                          Number = sa.Number,
                          Name = sa.Name,
                          Position = sa.Position,
                          Scale = sa.Scale,
                          Shape = sa.Asset.Shape,
                          IsLocked = sa.IsLocked,
                          ControlledBy = sa.ControlledBy,
                      }).ToList(),
#pragma warning restore RCS1077
                  })
                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return entity;
    }

    /// <inheritdoc />
    public async Task<Scene> AddAsync(Guid adventureId, Scene scene, CancellationToken ct = default) {
        var entity = new SceneEntity {
            Id = scene.Id,
            AdventureId = adventureId,
            Name = scene.Name,
            Description = scene.Description,
            Stage = scene.Stage,
            SceneAssets = scene.SceneAssets.ConvertAll(sa => new SceneAssetEntity {
                SceneId = scene.Id,
                AssetId = sa.Id,
                Number = sa.Number,
                Name = sa.Name,
                Position = sa.Position,
                Scale = sa.Scale,
                IsLocked = sa.IsLocked,
                ControlledBy = sa.ControlledBy,
            }),
        };
        await context.Scenes.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        return scene;
    }

    /// <inheritdoc />
    public async Task<Scene?> UpdateAsync(Scene scene, CancellationToken ct = default) {
        var entity = await context.Scenes
                                .Include(s => s.SceneAssets)
                                    .ThenInclude(ea => ea.Asset)
                                .FirstOrDefaultAsync(s => s.Id == scene.Id, ct);
        if (entity == null) return null;
        entity.Name = scene.Name;
        entity.Description = scene.Description;
        entity.Stage = scene.Stage;
        entity.SceneAssets = scene.SceneAssets.ConvertAll(sa => new SceneAssetEntity {
            SceneId = scene.Id,
            AssetId = sa.Id,
            Number = sa.Number,
            Name = sa.Name,
            Position = sa.Position,
            Scale = sa.Scale,
            Asset = entity.SceneAssets.FirstOrDefault(esa => esa.AssetId == sa.Id)?.Asset
                    ?? new AssetEntity {
                        Id = sa.Id,
                        Name = sa.Name,
                        Description = sa.Description,
                        Type = sa.Type,
                        Shape = sa.Shape,
                        IsPublished = false,
                        IsPublic = false,
                    },
            IsLocked = sa.IsLocked,
            ControlledBy = sa.ControlledBy,
        });
        context.Scenes.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0 ? scene : null;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var scene = await context.Scenes.FindAsync([id], ct);
        if (scene == null)
            return false;
        context.Scenes.Remove(scene);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}