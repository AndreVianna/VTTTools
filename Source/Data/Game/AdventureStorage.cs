namespace VttTools.Data.Game;

/// <summary>
/// EF Core storage implementation for Adventure entities.
/// </summary>
public class AdventureStorage(ApplicationDbContext context)
    : IAdventureStorage
{
    /// <inheritdoc />
    public Task<Adventure[]> GetAllAsync(CancellationToken ct = default)
        => context.Adventures
                  .Include(a => a.Episodes)
                  .AsNoTrackingWithIdentityResolution()
                  .ToArrayAsync(ct);

    /// <inheritdoc />
    public Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Adventures
                  .Include(a => a.Episodes)
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(a => a.Id == id, ct);
    
    /// <inheritdoc />
    public async Task<Adventure> AddAsync(Adventure adventure, CancellationToken ct = default)
    {
        await context.Adventures.AddAsync(adventure, ct);
        await context.SaveChangesAsync(ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Adventure> UpdateAsync(Adventure adventure, CancellationToken ct = default)
    {
        context.Adventures.Update(adventure);
        await context.SaveChangesAsync(ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Adventure adventure, CancellationToken ct = default)
    {
        context.Adventures.Remove(adventure);
        await context.SaveChangesAsync(ct);
    }
}