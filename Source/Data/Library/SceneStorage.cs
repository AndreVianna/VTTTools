using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneRegionEntity = VttTools.Data.Library.Entities.SceneRegion;
using SceneSourceEntity = VttTools.Data.Library.Entities.SceneSource;
using SceneWallEntity = VttTools.Data.Library.Entities.SceneWall;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Scene entities.
/// </summary>
public class SceneStorage(ApplicationDbContext context)
    : ISceneStorage {
    /// <inheritdoc />
    public Task<Scene[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Scenes
                  .Include(e => e.Background)
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .Select(Mapper.AsScene);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public Task<Scene[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default) {
        var query = context.Scenes
                  .Include(e => e.Background)
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Where(e => e.AdventureId == adventureId)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .Select(Mapper.AsScene);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Scene?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Scenes
                  .Include(e => e.Background)
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Include(e => e.Walls)
                  .Include(e => e.Regions)
                  .Include(e => e.Sources)
                  .Include(e => e.Adventure)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Scene scene, Guid adventureId, CancellationToken ct = default) {
        var entity = scene.ToEntity(adventureId);
        await context.Scenes.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task AddAsync(Scene scene, CancellationToken ct = default) {
        var entity = scene.ToEntity(scene.Adventure.Id);
        await context.Scenes.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Scene scene, Guid adventureId, CancellationToken ct = default) {
        var entity = scene.ToEntity(adventureId);
        context.Scenes.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Scene scene, CancellationToken ct = default) {
        var entity = await context.Scenes
            .Include(s => s.SceneAssets)
            .FirstOrDefaultAsync(s => s.Id == scene.Id, ct);

        if (entity == null)
            return false;

        entity.UpdateFrom(scene);  // ✅ Use existing UpdateFrom method
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Guid id, SceneAsset sceneAsset, CancellationToken ct = default) {
        var entity = await context.Scenes
            .Include(s => s.SceneAssets)
                .ThenInclude(sa => sa.Asset)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Id == id, ct);
        if (entity == null)
            return false;
        var sceneAssetEntity = entity.SceneAssets.FirstOrDefault(sa => sa.Index == sceneAsset.Index);
        if (sceneAssetEntity == null)
            return false;
        sceneAssetEntity.UpdateFrom(id, sceneAsset);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var scene = await context.Scenes.FindAsync([id], ct);
        if (scene == null)
            return false;
        context.Scenes.RemoveRange(context.Scenes.Where(a => a.Id == id));
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<SceneWall?> GetWallByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<SceneWallEntity>()
            .Include(sb => sb.Scene)
            .AsNoTracking()
            .FirstOrDefaultAsync(sb => sb.SceneId == id && sb.Index == index, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddWallAsync(Guid id, SceneWall sceneWall, CancellationToken ct = default) {
        var entity = sceneWall.ToEntity(id);
        await context.Set<SceneWallEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateWallAsync(Guid id, SceneWall sceneWall, CancellationToken ct = default) {
        var entity = await context.Set<SceneWallEntity>()
            .FirstOrDefaultAsync(sb => sb.SceneId == id && sb.Index == sceneWall.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, sceneWall);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteWallAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<SceneWallEntity>()
            .FirstOrDefaultAsync(sb => sb.SceneId == id && sb.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<SceneWallEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<SceneRegion?> GetRegionByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<SceneRegionEntity>()
            .Include(sr => sr.Scene)
            .AsNoTracking()
            .FirstOrDefaultAsync(sr => sr.SceneId == id && sr.Index == index, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddRegionAsync(Guid id, SceneRegion sceneRegion, CancellationToken ct = default) {
        var entity = sceneRegion.ToEntity(id);
        await context.Set<SceneRegionEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateRegionAsync(Guid id, SceneRegion sceneRegion, CancellationToken ct = default) {
        var entity = await context.Set<SceneRegionEntity>()
            .FirstOrDefaultAsync(sr => sr.SceneId == id && sr.Index == sceneRegion.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, sceneRegion);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteRegionAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<SceneRegionEntity>()
            .FirstOrDefaultAsync(sr => sr.SceneId == id && sr.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<SceneRegionEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<SceneSource?> GetSourceByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<SceneSourceEntity>()
            .Include(ss => ss.Scene)
            .AsNoTracking()
            .FirstOrDefaultAsync(ss => ss.SceneId == id && ss.Index == index, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddSourceAsync(Guid id, SceneSource sceneSource, CancellationToken ct = default) {
        var entity = sceneSource.ToEntity(id);
        await context.Set<SceneSourceEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateSourceAsync(Guid id, SceneSource sceneSource, CancellationToken ct = default) {
        var entity = await context.Set<SceneSourceEntity>()
            .FirstOrDefaultAsync(ss => ss.SceneId == id && ss.Index == sceneSource.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, sceneSource);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteSourceAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<SceneSourceEntity>()
            .FirstOrDefaultAsync(ss => ss.SceneId == id && ss.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<SceneSourceEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}