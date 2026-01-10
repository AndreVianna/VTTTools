namespace VttTools.Data.Media;

public class MediaStorage(ApplicationDbContext context, ILogger<MediaStorage> logger)
    : IMediaStorage {
    public async Task<(ResourceMetadata[] Items, int TotalCount)> FilterAsync(
        ResourceFilterData filter,
        CancellationToken ct = default) {
        var query = context.Resources.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.SearchText)) {
            var search = $"%{filter.SearchText}%";
            query = query.Where(r => EF.Functions.Like(r.FileName, search));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.Id)
            .Skip(filter.Skip)
            .Take(filter.Take)
            .Select(Mapper.AsResource)
            .ToArrayAsync(ct);

        return (items, totalCount);
    }

    public async Task<ResourceMetadata?> FindByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Resources
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, ct);
        if (entity is not null) {
            logger.LogDebug("[DEBUG] MediaStorage.FindByIdAsync {Id}: OwnerId={OwnerId}, ContentType={ContentType}, FileName={FileName}",
                entity.Id, entity.OwnerId, entity.ContentType, entity.FileName);
        }
        return entity.ToModel();
    }

    public async Task AddAsync(ResourceMetadata resource, CancellationToken ct = default) {
        logger.LogDebug("[DEBUG] MediaStorage.AddAsync BEFORE: Id={Id}, OwnerId={OwnerId}, ContentType={ContentType}, FileName={FileName}",
            resource.Id, resource.OwnerId, resource.ContentType, resource.FileName);
        var entity = resource.ToEntity();
        logger.LogDebug("[DEBUG] MediaStorage.AddAsync ENTITY: Id={Id}, OwnerId={OwnerId}, ContentType={ContentType}, FileName={FileName}",
            entity.Id, entity.OwnerId, entity.ContentType, entity.FileName);
        await context.Resources.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        logger.LogDebug("[DEBUG] MediaStorage.AddAsync AFTER SaveChanges: Id={Id}, OwnerId={OwnerId}",
            entity.Id, entity.OwnerId);
    }

    public async Task<bool> UpdateAsync(ResourceMetadata resource, CancellationToken ct = default) {
        logger.LogDebug("[DEBUG] MediaStorage.UpdateAsync called for Id={Id}, incoming OwnerId={OwnerId}",
            resource.Id, resource.OwnerId);
        var entity = await context.Resources
            .FirstOrDefaultAsync(e => e.Id == resource.Id, ct);
        if (entity is null)
            return false;
        logger.LogDebug("[DEBUG] MediaStorage.UpdateAsync BEFORE update: DB OwnerId={OwnerId}",
            entity.OwnerId);
        entity.UpdateFrom(resource);
        logger.LogDebug("[DEBUG] MediaStorage.UpdateAsync AFTER update: entity OwnerId={OwnerId}",
            entity.OwnerId);

        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var resource = await context.Resources.FindAsync([id], ct);
        if (resource == null)
            return false;
        context.Resources.Remove(resource);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}