namespace VttTools.Data.Assets;

/// <summary>
/// EF Core storage implementation for Effect entities (stub for future implementation)
/// </summary>
public class EffectStorage(ApplicationDbContext context) {
    /// <summary>
    /// Gets all effects owned by a user
    /// </summary>
    public async Task<Effect[]> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) {
        var entities = await context.Effects
            .Include(e => e.Image)
            .AsNoTrackingWithIdentityResolution()
            .Where(e => e.OwnerId == ownerId)
            .ToArrayAsync(ct);

        return [.. entities.Select(ToModel)];
    }

    /// <summary>
    /// Gets an effect by ID
    /// </summary>
    public async Task<Effect?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Effects
            .Include(e => e.Image)
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
            ImageId = effect.Image?.Id,
            Category = effect.Category,
            CreatedAt = effect.CreatedAt
        };

        await context.Effects.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }
    private static Effect ToModel(Entities.Effect entity)
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = entity.Name,
            Description = entity.Description,
            Shape = entity.Shape,
            Size = entity.Size,
            Direction = entity.Direction,
            BoundedByStructures = entity.BoundedByStructures,
            Image = entity.Image != null ? new Resource {
                Id = entity.Image.Id,
                Type = entity.Image.Type,
                Path = entity.Image.Path,
                Metadata = new() {
                    ContentType = entity.Image.ContentType,
                    FileName = entity.Image.FileName,
                    FileLength = entity.Image.FileLength,
                    ImageSize = entity.Image.ImageSize,
                    Duration = entity.Image.Duration
                },
                Tags = entity.Image.Tags
            } : null,
            Category = entity.Category,
            CreatedAt = entity.CreatedAt
        };
}