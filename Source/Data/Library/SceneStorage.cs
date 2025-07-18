using Scene = VttTools.Library.Scenes.Model.Scene;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Scene entities.
/// </summary>
public class SceneStorage(ApplicationDbContext context)
    : ISceneStorage {
    /// <inheritdoc />
    public Task<Scene[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Scenes
                  .Include(e => e.Stage)
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
                  .Select(Mapper.AsScene);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public Task<Scene[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default) {
        var query = context.Scenes
                  .Include(e => e.Stage)
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Where(e => e.AdventureId == adventureId)
                  .AsNoTrackingWithIdentityResolution()
                  .Select(Mapper.AsScene);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Scene?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Scenes
                  .Include(e => e.Stage)
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
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
        var entity = scene.ToEntity();
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
        var entity = scene.ToEntity();
        context.Scenes.Update(entity);
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
}