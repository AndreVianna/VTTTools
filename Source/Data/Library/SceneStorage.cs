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
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Scene[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default)
        => context.Scenes
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Where(e => e.AdventureId == adventureId)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Scene?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Scenes
                  .Include(e => e.SceneAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(e => e.Id == id, ct);

    /// <inheritdoc />
    public async Task<Scene> AddAsync(Scene scene, CancellationToken ct = default) {
        await context.Scenes.AddAsync(scene, ct);
        await context.SaveChangesAsync(ct);
        return scene;
    }

    /// <inheritdoc />
    public async Task<Scene?> UpdateAsync(Scene scene, CancellationToken ct = default) {
        context.Scenes.Update(scene);
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