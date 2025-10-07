using Structure = VttTools.Library.Scenes.Model.Structure;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Structure entities (stub for future implementation)
/// </summary>
public class StructureStorage(ApplicationDbContext context) {
    /// <summary>
    /// Gets all structures owned by a user
    /// </summary>
    public async Task<Structure[]> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) {
        var entities = await context.Structures
            .Include(s => s.Visual)
            .AsNoTrackingWithIdentityResolution()
            .Where(s => s.OwnerId == ownerId)
            .ToArrayAsync(ct);

        return entities.Select(ToModel).ToArray();
    }

    /// <summary>
    /// Gets a structure by ID
    /// </summary>
    public async Task<Structure?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Structures
            .Include(s => s.Visual)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        return entity != null ? ToModel(entity) : null;
    }

    /// <summary>
    /// Adds a new structure
    /// </summary>
    public async Task AddAsync(Structure structure, CancellationToken ct = default) {
        var entity = new Entities.Structure {
            Id = structure.Id,
            OwnerId = structure.OwnerId,
            Name = structure.Name,
            Description = structure.Description,
            IsBlocking = structure.IsBlocking,
            IsOpaque = structure.IsOpaque,
            IsSecret = structure.IsSecret,
            IsOpenable = structure.IsOpenable,
            IsLocked = structure.IsLocked,
            VisualResourceId = structure.Visual?.Id,
            CreatedAt = structure.CreatedAt
        };

        await context.Structures.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    private static Structure ToModel(Entities.Structure entity) =>
        new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = entity.Name,
            Description = entity.Description,
            IsBlocking = entity.IsBlocking,
            IsOpaque = entity.IsOpaque,
            IsSecret = entity.IsSecret,
            IsOpenable = entity.IsOpenable,
            IsLocked = entity.IsLocked,
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
            CreatedAt = entity.CreatedAt
        };
}
