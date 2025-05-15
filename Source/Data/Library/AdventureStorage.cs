namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Adventure entities.
/// </summary>
public class AdventureStorage(ApplicationDbContext context, ILoggerFactory loggerFactory)
    : IAdventureStorage {
    private readonly ILogger _logger =  loggerFactory.CreateLogger<AdventureStorage>();

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
    public async Task AddAsync(Adventure adventure, CancellationToken ct = default) {
        try {
            await context.Adventures.AddAsync(adventure, ct);
            await context.SaveChangesAsync(ct);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Failed to create an adventure.");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Adventure adventure, CancellationToken ct = default) {
        try {
            context.Adventures.Update(adventure);
            await context.SaveChangesAsync(ct);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Failed to update the adventure {AdventureId}.", adventure.Id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        try {
            context.Adventures.RemoveRange(context.Adventures.Where(a => a.Id == id));
            await context.SaveChangesAsync(ct);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Failed to delete the adventure {AdventureId}.", id);
            throw;
        }
    }
}