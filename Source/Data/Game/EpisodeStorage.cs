namespace VttTools.Data.Game;

/// <summary>
/// EF Core storage implementation for Episode entities.
/// </summary>
public class EpisodeStorage(ApplicationDbContext context)
    : IEpisodeStorage {
    /// <inheritdoc />
    public Task<Episode[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default)
        => context.Episodes
                  .Include(e => e.Adventure)
                  .Include(e => e.EpisodeAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Where(e => e.ParentId == adventureId)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Episode?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Episodes
                  .Include(e => e.Adventure)
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
    public async Task<Episode> UpdateAsync(Episode episode, CancellationToken ct = default) {
        context.Episodes.Update(episode);
        await context.SaveChangesAsync(ct);
        return episode;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Episode episode, CancellationToken ct = default) {
        context.Episodes.Remove(episode);
        await context.SaveChangesAsync(ct);
    }
}