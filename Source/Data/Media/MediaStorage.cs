namespace VttTools.Data.Media;

/// <summary>
/// EF Core storage implementation for media entities.
/// </summary>
public class MediaStorage(ApplicationDbContext context)
    : IMediaStorage {
    /// <inheritdoc />
    public async Task<Resource[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Resources
                  .AsNoTrackingWithIdentityResolution()
                  .Select(Mapper.AsResource);
        var result = await query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Resource?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Resources
                  .AsNoTrackingWithIdentityResolution()
                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Resource resource, CancellationToken ct = default) {
        var entity = resource.ToEntity();
        await context.Resources.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Resource resource, CancellationToken ct = default) {
        var entity = resource.ToEntity();
        context.Resources.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var resource = await context.Resources.FindAsync([id], ct);
        if (resource == null)
            return false;
        context.Resources.RemoveRange(context.Resources.Where(a => a.Id == id));
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}