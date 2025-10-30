using Scene = VttTools.Library.Scenes.Model.Scene;
using SceneBarrierEntity = VttTools.Data.Library.Entities.SceneBarrier;
using SceneRegionEntity = VttTools.Data.Library.Entities.SceneRegion;
using SceneSourceEntity = VttTools.Data.Library.Entities.SceneSource;

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
                  .Include(e => e.SceneBarriers)
                    .ThenInclude(sb => sb.Barrier)
                  .Include(e => e.SceneRegions)
                    .ThenInclude(sr => sr.Region)
                  .Include(e => e.SceneSources)
                    .ThenInclude(ss => ss.Source)
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
    public async Task<bool> UpdateAsync(SceneAsset sceneAsset, Guid sceneId, CancellationToken ct = default) {
        var entity = await context.Scenes
            .Include(s => s.SceneAssets)
                .ThenInclude(sa => sa.Asset)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Id == sceneId, ct);
        if (entity == null)
            return false;
        var sceneAssetEntity = entity.SceneAssets.FirstOrDefault(sa => sa.Index == sceneAsset.Index);
        if (sceneAssetEntity == null)
            return false;
        sceneAssetEntity.UpdateFrom(sceneId, sceneAsset);
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
    public async Task<SceneBarrier?> GetSceneBarrierByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Set<SceneBarrierEntity>()
            .Include(sb => sb.Barrier)
            .AsNoTracking()
            .FirstOrDefaultAsync(sb => sb.Id == id, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddSceneBarrierAsync(SceneBarrier sceneBarrier, Guid sceneId, CancellationToken ct = default) {
        var entity = sceneBarrier.ToEntity(sceneId);
        await context.Set<SceneBarrierEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateSceneBarrierAsync(SceneBarrier sceneBarrier, CancellationToken ct = default) {
        var entity = await context.Set<SceneBarrierEntity>()
            .FirstOrDefaultAsync(sb => sb.Id == sceneBarrier.Id, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(sceneBarrier.SceneId, sceneBarrier);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteSceneBarrierAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Set<SceneBarrierEntity>().FindAsync([id], ct);
        if (entity == null)
            return false;
        context.Set<SceneBarrierEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<SceneRegion?> GetSceneRegionByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Set<SceneRegionEntity>()
            .Include(sr => sr.Region)
            .AsNoTracking()
            .FirstOrDefaultAsync(sr => sr.Id == id, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddSceneRegionAsync(SceneRegion sceneRegion, Guid sceneId, CancellationToken ct = default) {
        var entity = sceneRegion.ToEntity(sceneId);
        await context.Set<SceneRegionEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateSceneRegionAsync(SceneRegion sceneRegion, CancellationToken ct = default) {
        var entity = await context.Set<SceneRegionEntity>()
            .FirstOrDefaultAsync(sr => sr.Id == sceneRegion.Id, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(sceneRegion.SceneId, sceneRegion);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteSceneRegionAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Set<SceneRegionEntity>().FindAsync([id], ct);
        if (entity == null)
            return false;
        context.Set<SceneRegionEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<SceneSource?> GetSceneSourceByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Set<SceneSourceEntity>()
            .Include(ss => ss.Source)
            .AsNoTracking()
            .FirstOrDefaultAsync(ss => ss.Id == id, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddSceneSourceAsync(SceneSource sceneSource, Guid sceneId, CancellationToken ct = default) {
        var entity = sceneSource.ToEntity(sceneId);
        await context.Set<SceneSourceEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateSceneSourceAsync(SceneSource sceneSource, CancellationToken ct = default) {
        var entity = await context.Set<SceneSourceEntity>()
            .FirstOrDefaultAsync(ss => ss.Id == sceneSource.Id, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(sceneSource.SceneId, sceneSource);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteSceneSourceAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Set<SceneSourceEntity>().FindAsync([id], ct);
        if (entity == null)
            return false;
        context.Set<SceneSourceEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}