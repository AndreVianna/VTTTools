namespace VttTools.Data.Game;

/// <summary>
/// EF Core storage implementation for Episode entities.
/// </summary>
public class EpisodeStorage(ApplicationDbContext context)
    : IEpisodeStorage {
    /// <inheritdoc />
    public Task<Episode[]> GetAllAsync(CancellationToken ct = default)
        => context.Episodes
                  .Include(e => e.EpisodeAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Episode[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default)
        => context.Episodes
                  .Include(e => e.EpisodeAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Where(e => e.ParentId == adventureId)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Episode?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Episodes
                  .Include(e => e.EpisodeAssets)
                    .ThenInclude(ea => ea.Asset)
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(e => e.Id == id, ct);

    /// <inheritdoc />
    public async Task<Episode> AddAsync(Episode episode, CancellationToken ct = default) {
        await context.Episodes.AddAsync(episode, ct);
        await context.SaveChangesAsync(ct);
        return episode;
    }

    /// <inheritdoc />
    public async Task<Episode?> UpdateAsync(Episode episode, CancellationToken ct = default) {
        context.Episodes.Update(episode);
        var result = await context.SaveChangesAsync(ct);
        return result > 0 ? episode : null;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var episode = await context.Episodes.FindAsync([id], ct);
        if (episode == null)
            return false;
        context.Episodes.Remove(episode);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}