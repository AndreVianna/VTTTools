using Adventure = VttTools.Library.Adventures.Model.Adventure;
using AdventureEntity = VttTools.Data.Library.Entities.Adventure;
using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneAsset = VttTools.Library.Scenes.Model.SceneAsset;
using SceneAssetEntity = VttTools.Data.Library.Entities.SceneAsset;
using SceneEntity = VttTools.Data.Library.Entities.Scene;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Adventure entities.
/// </summary>
public class AdventureStorage(ApplicationDbContext context)
    : IAdventureStorage {
    /// <inheritdoc />
    public async Task<Adventure[]> GetAllAsync(CancellationToken ct = default) {
        try {
            var query = context.Adventures
                .Include(a => a.Scenes)
                    .ThenInclude(s => s.SceneAssets)
                        .ThenInclude(sa => sa.Asset)
                .AsNoTrackingWithIdentityResolution()
                .Select(a => new Adventure {
                    OwnerId = a.OwnerId,
                    CampaignId = a.CampaignId,
                    Id = a.Id,
                    Name = a.Name,
                    Description = a.Description,
                    Type = a.Type,
                    ImageId = a.ImageId,
                    IsPublic = a.IsPublic,
                    IsPublished = a.IsPublished,
                    Scenes = a.Scenes.Select(s => new Scene {
                        Id = s.Id,
                        Name = s.Name,
                        Description = s.Description,
                        Stage = s.Stage,
                        SceneAssets = s.SceneAssets.Select(sa => new SceneAsset {
                            Id = sa.Asset.Id,
                            Description = sa.Asset.Description,
                            Type = sa.Asset.Type,
                            Shape = sa.Asset.Shape,
                            Number = sa.Number,
                            Name = sa.Name,
                            Position = sa.Position,
                            Scale = sa.Scale,
                            Elevation = sa.Elevation,
                            Rotation = sa.Rotation,
                            IsLocked = sa.IsLocked,
                            ControlledBy = sa.ControlledBy,
                        }).ToList(),
                    }).ToList(),
                });
            return await query.ToArrayAsync(ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Adventures
                  .Include(a => a.Scenes)
                  .AsNoTrackingWithIdentityResolution()
                  .Select(a => new Adventure {
                      OwnerId = a.OwnerId,
                      CampaignId = a.CampaignId,
                      Id = a.Id,
                      Name = a.Name,
                      Description = a.Description,
                      Type = a.Type,
                      ImageId = a.ImageId,
                      IsPublic = a.IsPublic,
                      IsPublished = a.IsPublished,
                      Scenes = a.Scenes.Select(s => new Scene {
                          Id = s.Id,
                          Name = s.Name,
                          Description = s.Description,
                          Stage = s.Stage,
                          SceneAssets = s.SceneAssets.Select(sa => new SceneAsset {
                              Id = sa.Asset.Id,
                              Description = sa.Asset.Description,
                              Type = sa.Asset.Type,
                              Shape = sa.Asset.Shape,
                              Number = sa.Number,
                              Name = sa.Name,
                              Position = sa.Position,
                              Scale = sa.Scale,
                              Elevation = sa.Elevation,
                              Rotation = sa.Rotation,
                              IsLocked = sa.IsLocked,
                              ControlledBy = sa.ControlledBy,
                          }).ToList(),
                      }).ToList(),
                  })
                  .FirstOrDefaultAsync(a => a.Id == id, ct);

    /// <inheritdoc />
    public async Task AddAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = new AdventureEntity {
            OwnerId = adventure.OwnerId,
            CampaignId = adventure.CampaignId,
            Id = adventure.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            ImageId = adventure.ImageId,
            IsPublic = adventure.IsPublic,
            IsPublished = adventure.IsPublished,
        };
        await context.Adventures.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = await context.Adventures
                                   .Include(a => a.Scenes)
                                       .ThenInclude(s => s.SceneAssets)
                                   .FirstOrDefaultAsync(a => a.Id == adventure.Id, ct);
        if (entity is null)
            return;
        entity.OwnerId = adventure.OwnerId;
        entity.CampaignId = adventure.CampaignId;
        entity.Name = adventure.Name;
        entity.Description = adventure.Description;
        entity.Type = adventure.Type;
        entity.ImageId = adventure.ImageId;
        entity.IsPublic = adventure.IsPublic;
        entity.IsPublished = adventure.IsPublished;
        entity.Scenes = adventure.Scenes.ConvertAll(s => new SceneEntity {
            Id = s.Id,
            AdventureId = adventure.Id,
            Name = s.Name,
            Description = s.Description,
            Stage = s.Stage,
            SceneAssets = s.SceneAssets.ConvertAll(sa => new SceneAssetEntity {
                AssetId = sa.Id,
                SceneId = s.Id,
                Number = sa.Number,
                Name = sa.Name,
                Position = sa.Position,
                Scale = sa.Scale,
                Elevation = sa.Elevation,
                Rotation = sa.Rotation,
                IsLocked = sa.IsLocked,
                ControlledBy = sa.ControlledBy,
            }),
        });
        context.Adventures.Update(entity);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        context.Adventures.RemoveRange(context.Adventures.Where(a => a.Id == id));
        await context.SaveChangesAsync(ct);
    }
}