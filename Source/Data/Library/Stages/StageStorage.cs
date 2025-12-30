using IStageStorage = VttTools.Library.Stages.Storage.IStageStorage;
using Stage = VttTools.Library.Stages.Model.Stage;
using StageEntity = VttTools.Data.Library.Stages.Entities.Stage;

namespace VttTools.Data.Library.Stages;

public class StageStorage(ApplicationDbContext context)
    : IStageStorage {
    public async Task<(Stage[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default) {
        var query = context.Stages.AsQueryable();

        query = ApplySearchFilters(query, filter, masterUserId);
        var totalCount = await query.CountAsync(ct);

        query = ApplySorting(query, filter);
        var entities = await query
            .Skip(filter.Skip)
            .Take(filter.Take)
            .AsNoTracking()
            .ToListAsync(ct);

        var items = entities.Select(e => e.ToModel()!).ToArray();
        return (items, totalCount);
    }

    public Task<Stage[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Stages
            .Include(s => s.MainBackground)
            .Include(s => s.AlternateBackground)
            .Include(s => s.AmbientSound)
            .AsSplitQuery()
            .AsNoTracking()
            .Select(StageMapper.AsStage);
        return query.ToArrayAsync(ct);
    }

    public Task<Stage[]> GetManyAsync(string filterDefinition, CancellationToken ct = default) {
        var query = context.Stages
            .Include(s => s.MainBackground)
            .Include(s => s.AlternateBackground)
            .Include(s => s.AmbientSound)
            .AsSplitQuery()
            .AsNoTracking()
            .Select(StageMapper.AsStage);
        return query.ToArrayAsync(ct);
    }

    public async Task<Stage?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Stages
            .Include(s => s.MainBackground)
            .Include(s => s.AlternateBackground)
            .Include(s => s.AmbientSound)
            .Include(s => s.Walls)
                .ThenInclude(w => w.Segments)
            .Include(s => s.Regions)
                .ThenInclude(r => r.Vertices)
            .Include(s => s.Lights)
            .Include(s => s.Elements)
                .ThenInclude(d => d.Display)
            .Include(s => s.Sounds)
                .ThenInclude(a => a.Media)
            .AsSplitQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);
        return entity.ToModel();
    }

    public async Task AddAsync(Stage stage, CancellationToken ct = default) {
        var entity = stage.ToEntity();
        await context.Stages.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Stage stage, CancellationToken ct = default) {
        var entity = await context.Stages
            .Include(s => s.MainBackground)
            .Include(s => s.AlternateBackground)
            .Include(s => s.AmbientSound)
            .Include(s => s.Walls)
                .ThenInclude(w => w.Segments)
            .Include(s => s.Regions)
                .ThenInclude(r => r.Vertices)
            .Include(s => s.Lights)
            .Include(s => s.Elements)
            .Include(s => s.Sounds)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Id == stage.Id, ct);

        if (entity is null)
            return false;

        entity.UpdateFrom(stage);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var stage = await context.Stages.FindAsync([id], ct);
        if (stage is null)
            return false;
        context.Stages.RemoveRange(context.Stages.Where(s => s.Id == id));
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    private static IQueryable<StageEntity> ApplySearchFilters(
        IQueryable<StageEntity> query,
        LibrarySearchFilter filter,
        Guid masterUserId) {
        if (!string.IsNullOrWhiteSpace(filter.Search)) {
            var search = filter.Search.ToLowerInvariant();
            query = query.Where(s =>
                s.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase) ||
                s.Description.Contains(search, StringComparison.InvariantCultureIgnoreCase));
        }

        if (filter.OwnerId.HasValue)
            query = query.Where(s => s.OwnerId == filter.OwnerId.Value);

        if (!string.IsNullOrWhiteSpace(filter.OwnerType)) {
            query = filter.OwnerType.ToLowerInvariant() switch {
                "master" => query.Where(s => s.OwnerId == masterUserId),
                "user" => query.Where(s => s.OwnerId != masterUserId),
                _ => query,
            };
        }

        if (filter.IsPublished.HasValue)
            query = query.Where(s => s.IsPublished == filter.IsPublished.Value);

        return query;
    }

    private static IOrderedQueryable<StageEntity> ApplySorting(
        IQueryable<StageEntity> query,
        LibrarySearchFilter filter) {
        var sortBy = filter.SortBy?.ToLowerInvariant() ?? "name";
        var descending = filter.SortOrder?.ToLowerInvariant() == "desc";

        return sortBy switch {
            "name" => descending ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            _ => descending ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
        };
    }
}
