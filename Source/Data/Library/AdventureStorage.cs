using Adventure = VttTools.Library.Adventures.Model.Adventure;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Adventure entities.
/// </summary>
public class AdventureStorage(ApplicationDbContext context)
    : IAdventureStorage {
    /// <inheritdoc />
    public async Task<Adventure[]> GetAllAsync(CancellationToken ct = default) {
        try {
            var query = context.Adventures
                .Include(a => a.Scenes)
                    .ThenInclude(s => s.SceneAssets)
                        .ThenInclude(sa => sa.Asset)
                .AsNoTrackingWithIdentityResolution();
            return await query.Select(a => a.ToModel()).ToArrayAsync(ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<Adventure[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        try {
            var query = context.Adventures
                .Include(a => a.Scenes)
                    .ThenInclude(s => s.SceneAssets)
                        .ThenInclude(sa => sa.Asset)
                .AsNoTrackingWithIdentityResolution();

            switch (filterDefinition) {
                case not null when filterDefinition.StartsWith("Owned:"):
                    var userId = Guid.Parse(filterDefinition.Split(':')[1]);
                    query = query.Where(a => a.OwnerId == userId);
                    break;
                case "Available":
                    query = query.Where(a => a.IsPublic && a.IsPublished);
                    break;
            }

            return await query.Select(a => a.ToModel()).ToArrayAsync(ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<Adventure?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => (await context.Adventures
                         .Include(a => a.Scenes)
                         .AsNoTrackingWithIdentityResolution()
                         .FirstOrDefaultAsync(a => a.Id == id, ct)).ToModel();

    /// <inheritdoc />
    public async Task AddAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = adventure.ToEntity();
        await context.Adventures.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Adventure adventure, CancellationToken ct = default) {
        var entity = await context.Adventures
                                   .Include(a => a.Scenes)
                                       .ThenInclude(s => s.SceneAssets)
                                   .FirstOrDefaultAsync(a => a.Id == adventure.Id, ct);

        if (entity is null)
            return;
        entity.UpdateFrom(adventure);
        context.Adventures.Update(entity);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        context.Adventures.RemoveRange(context.Adventures.Where(a => a.Id == id));
        await context.SaveChangesAsync(ct);
    }
}