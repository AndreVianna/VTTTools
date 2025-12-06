namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Campaign entities.
/// </summary>
public class CampaignStorage(ApplicationDbContext context)
    : ICampaignStorage {
    /// <inheritdoc />
    public async Task<Campaign[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Campaigns
            .Include(c => c.Adventures)
                .ThenInclude(a => a.Encounters)
            .Include(c => c.Background)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.Select(Mapper.AsCampaign).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Campaign[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Campaigns
            .Include(c => c.Adventures)
                .ThenInclude(a => a.Encounters)
            .Include(c => c.Background)
            .AsSplitQuery()
            .AsNoTracking();

        switch (filterDefinition) {
            case not null when filterDefinition.Split(':') is ["OwnedBy", var id] && Guid.TryParse(id, out var ownerId):
                query = query.Where(c => c.OwnerId == ownerId);
                break;
            case not null when filterDefinition.Split(':') is ["AvailableTo", var id] && Guid.TryParse(id, out var userId):
                query = query.Where(c => c.OwnerId == userId || (c.IsPublic && c.IsPublished));
                break;
            case "Public":
                query = query.Where(c => c.IsPublic && c.IsPublished);
                break;
        }

        var result = await query.Select(Mapper.AsCampaign).ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var query = context.Campaigns
            .Include(c => c.Adventures)
                .ThenInclude(a => a.Encounters)
            .Include(c => c.Background)
            .AsSplitQuery()
            .AsNoTracking();
        var result = await query.FirstOrDefaultAsync(c => c.Id == id, ct);
        return result.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Campaign campaign, CancellationToken ct = default) {
        var entity = campaign.ToEntity();
        await context.Campaigns.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Campaign campaign, CancellationToken ct = default) {
        var entity = campaign.ToEntity();
        context.Campaigns.Update(entity);
        var count = await context.SaveChangesAsync(ct);
        return count > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Campaigns.FindAsync([id], ct);
        if (entity is null)
            return false;
        context.Campaigns.Remove(entity);
        await context.SaveChangesAsync(ct);
        return true;
    }
}