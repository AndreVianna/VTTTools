namespace VttTools.Data.Media;

public class MediaStorage(ApplicationDbContext context)
    : IMediaStorage {
    public async Task<(ResourceMetadata[] Items, int TotalCount)> FilterAsync(
        ResourceFilterData filter,
        CancellationToken ct = default) {
        var query = context.Resources
            .Include(r => r.Features)
            .AsNoTracking();

        if (filter.ResourceType.HasValue)
            query = query.Where(r => r.ResourceType == filter.ResourceType.Value);

        if (!string.IsNullOrWhiteSpace(filter.ContentKind))
            query = query.Where(r => r.Classification != null && r.Classification.Kind == filter.ContentKind);

        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(r => r.Classification != null && r.Classification.Category == filter.Category);

        if (!string.IsNullOrWhiteSpace(filter.SearchText)) {
            var search = $"%{filter.SearchText}%";
            query = query.Where(r =>
                EF.Functions.Like(r.FileName, search) ||
                (r.Description != null && EF.Functions.Like(r.Description, search)) ||
                (r.Classification != null && EF.Functions.Like(r.Classification.Type, search)));
        }

        if (filter.OwnerId.HasValue)
            query = query.Where(r => r.OwnerId == filter.OwnerId.Value);

        if (filter.IsPublic.HasValue)
            query = query.Where(r => r.IsPublic == filter.IsPublic.Value);

        if (filter.IsPublished.HasValue)
            query = query.Where(r => r.IsPublished == filter.IsPublished.Value);

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
            .Include(r => r.Features)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, ct);
        return entity.ToModel();
    }

    public async Task AddAsync(ResourceMetadata resource, CancellationToken ct = default) {
        var entity = resource.ToEntity();
        await context.Resources.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(ResourceMetadata resource, CancellationToken ct = default) {
        var entity = await context.Resources
            .Include(r => r.Features)
            .FirstOrDefaultAsync(e => e.Id == resource.Id, ct);

        if (entity is null)
            return false;

        entity.Features.Clear();
        entity.UpdateFrom(resource);

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