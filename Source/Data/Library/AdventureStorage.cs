namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Adventure entities.
/// </summary>
public class AdventureStorage(ApplicationDbContext context)
    : IAdventureStorage {
    /// <inheritdoc />
    public Task<Adventure[]> GetAllAsync(CancellationToken ct = default)
        => context.Adventures
                  .Include(a => a.Scenes)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Adventures
                  .Include(a => a.Scenes)
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(a => a.Id == id, ct);

    /// <inheritdoc />
    public async Task<Adventure> AddAsync(Adventure adventure, CancellationToken ct = default) {
        await context.Adventures.AddAsync(adventure, ct);
        await context.SaveChangesAsync(ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Adventure?> UpdateAsync(Adventure adventure, CancellationToken ct = default) {
        context.Adventures.Update(adventure);
        var result = await context.SaveChangesAsync(ct);
        return result > 0 ? adventure : null;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var adventure = await context.Adventures.FindAsync([id], ct);
        if (adventure == null)
            return false;
        context.Adventures.Remove(adventure);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}