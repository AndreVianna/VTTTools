using Effect = VttTools.Assets.Model.Effect;
using EffectEntity = VttTools.Data.Assets.Entities.Effect;

namespace VttTools.Data.Assets;

/// <summary>
/// EF Core storage implementation for Effect entities (stub for future implementation)
/// </summary>
public class EffectStorage(ApplicationDbContext context) {
    /// <summary>
    /// Gets all effects owned by a user
    /// </summary>
    public async Task<(Effect[] effects, int totalCount)> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) {
        var query = context.Effects
            .Include(e => e.Image)
            .Where(e => e.OwnerId == ownerId)
            .AsNoTracking()
            .AsSplitQuery();

        var totalCount = await query.CountAsync(ct);

        var effects = await query
            .Select(Mapper.AsEffect)
            .ToArrayAsync(ct);

        return (effects, totalCount);
    }

    /// <summary>
    /// Gets an effect by ID
    /// </summary>
    public async Task<Effect?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Effects
            .Include(e => e.Image)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        return entity?.ToModel();
    }

    /// <summary>
    /// Adds a new effect
    /// </summary>
    public async Task AddAsync(Effect effect, CancellationToken ct = default) {
        var entity = effect.ToEntity();
        await context.Effects.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }
}