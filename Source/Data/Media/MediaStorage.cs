namespace VttTools.Data.Media;

public class MediaStorage(ApplicationDbContext context)
    : IMediaStorage {
    // With junction tables architecture, Resources are pure media metadata without Role.
    // To filter by Role, query through parent entities (Asset, Campaign, etc.) or junction tables.
    public async Task<(ResourceMetadata[] Items, int TotalCount)> FilterAsync(
        ResourceFilterData filter,
        CancellationToken ct = default) {
        var query = context.Resources.AsNoTracking();

        // Note: Role filtering is no longer available at Resource level.
        // Role is stored in junction tables (AssetResources, CampaignResources, etc.)

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
        return entity.ToModel();
    }

    public async Task AddAsync(ResourceMetadata resource, CancellationToken ct = default) {
        var entity = resource.ToEntity();
        await context.Resources.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(ResourceMetadata resource, CancellationToken ct = default) {
        var entity = await context.Resources
            .FirstOrDefaultAsync(e => e.Id == resource.Id, ct);

        if (entity is null)
            return false;

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