using Effect = VttTools.Library.Scenes.Model.Effect;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Effect entities (stub for future implementation)
/// </summary>
public class EffectStorage(ApplicationDbContext context) {
    /// <summary>
    /// Gets all effects owned by a user
    /// </summary>
    public async Task<Effect[]> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) {
        var entities = await context.Effects
            .Include(e => e.Visual)
            .AsNoTrackingWithIdentityResolution()
            .Where(e => e.OwnerId == ownerId)
            .ToArrayAsync(ct);

        return entities.Select(ToModel).ToArray();
    }

    /// <summary>
    /// Gets an effect by ID
    /// </summary>
    public async Task<Effect?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Effects
            .Include(e => e.Visual)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        return entity != null ? ToModel(entity) : null;
    }

    /// <summary>
    /// Adds a new effect
    /// </summary>
    public async Task AddAsync(Effect effect, CancellationToken ct = default) {
        var entity = new Entities.Effect {
            Id = effect.Id,
            OwnerId = effect.OwnerId,
            Name = effect.Name,
            Description = effect.Description,
            Shape = effect.Shape,
            Size = effect.Size,
            Direction = effect.Direction,
            BoundedByStructures = effect.BoundedByStructures,
            VisualResourceId = effect.Visual?.Id,
            Category = effect.Category,
            CreatedAt = effect.CreatedAt
        };

        await context.Effects.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    private static Effect ToModel(Entities.Effect entity) =>
        new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = entity.Name,
            Description = entity.Description,
            Shape = entity.Shape,
            Size = entity.Size,
            Direction = entity.Direction,
            BoundedByStructures = entity.BoundedByStructures,
            Visual = entity.Visual != null ? new Resource {
                Id = entity.Visual.Id,
                Type = entity.Visual.Type,
                Path = entity.Visual.Path,
                Metadata = new() {
                    ContentType = entity.Visual.ContentType,
                    FileName = entity.Visual.FileName,
                    FileLength = entity.Visual.FileLength,
                    ImageSize = entity.Visual.ImageSize,
                    Duration = entity.Visual.Duration
                },
                Tags = entity.Visual.Tags
            } : null,
            Category = entity.Category,
            CreatedAt = entity.CreatedAt
        };
}
