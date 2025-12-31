using Encounter = VttTools.Library.Encounters.Model.Encounter;

using EncounterActorEntity = VttTools.Data.Library.Encounters.Entities.EncounterActor;
using EncounterEffectEntity = VttTools.Data.Library.Encounters.Entities.EncounterEffect;
using EncounterPropEntity = VttTools.Data.Library.Encounters.Entities.EncounterObject;

namespace VttTools.Data.Library.Encounters;

public class EncounterStorage(ApplicationDbContext context)
    : IEncounterStorage {
    public async Task<(Encounter[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default) {
        var query = context.Encounters
            .Include(e => e.Adventure)
            .AsQueryable();

        query = ApplySearchFilters(query, filter, masterUserId);
        var totalCount = await query.CountAsync(ct);

        query = ApplySorting(query, filter);
        var entities = await query
            .Skip(filter.Skip)
            .Take(filter.Take)
            .AsNoTracking()
            .ToListAsync(ct);

        var items = entities.Select(e => e.ToModel(includeParent: true)).ToArray();
        return (items, totalCount);
    }

    public Task<Encounter[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Encounters
                  .Include(e => e.Stage)
                      .ThenInclude(r => r.MainBackground)
                  .Include(e => e.Stage)
                      .ThenInclude(r => r.AlternateBackground)
                  .Include(e => e.Stage)
                      .ThenInclude(r => r.AmbientSound)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .Select(Mapper.AsEncounter);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    public Task<Encounter[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default) {
        var query = context.Encounters
                  .Include(e => e.Stage)
                      .ThenInclude(r => r.MainBackground)
                  .Include(e => e.Stage)
                      .ThenInclude(r => r.AlternateBackground)
                  .Include(e => e.Stage)
                      .ThenInclude(r => r.AmbientSound)
                  .Where(e => e.AdventureId == adventureId)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .Select(Mapper.AsEncounter);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    public async Task<Encounter?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Encounters
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.MainBackground)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.AlternateBackground)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.AmbientSound)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.Walls)
                          .ThenInclude(w => w.Segments)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.Regions)
                          .ThenInclude(r => r.Vertices)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.Lights)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.Elements)
                          .ThenInclude(el => el.Display)
                  .Include(e => e.Stage)
                      .ThenInclude(s => s.Sounds)
                          .ThenInclude(snd => snd.Media)
                  .Include(e => e.Actors)
                      .ThenInclude(a => a.Asset)
                          .ThenInclude(asset => asset.Tokens)
                              .ThenInclude(t => t.Token)
                  .Include(e => e.Actors)
                      .ThenInclude(a => a.Asset)
                          .ThenInclude(asset => asset.Portrait)
                  .Include(e => e.Actors)
                      .ThenInclude(a => a.Asset)
                          .ThenInclude(asset => asset.Thumbnail)
                  .Include(e => e.Actors)
                      .ThenInclude(a => a.Display)
                  .Include(e => e.Objects)
                      .ThenInclude(p => p.Asset)
                          .ThenInclude(asset => asset.Tokens)
                              .ThenInclude(t => t.Token)
                  .Include(e => e.Objects)
                      .ThenInclude(p => p.Asset)
                          .ThenInclude(asset => asset.Portrait)
                  .Include(e => e.Objects)
                      .ThenInclude(p => p.Asset)
                          .ThenInclude(asset => asset.Thumbnail)
                  .Include(e => e.Objects)
                      .ThenInclude(p => p.ClosedDisplay)
                  .Include(e => e.Objects)
                      .ThenInclude(p => p.OpenedDisplay)
                  .Include(e => e.Objects)
                      .ThenInclude(p => p.DestroyedDisplay)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.Asset)
                          .ThenInclude(asset => asset.Tokens)
                              .ThenInclude(t => t.Token)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.Asset)
                          .ThenInclude(asset => asset.Portrait)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.Asset)
                          .ThenInclude(asset => asset.Thumbnail)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.EnabledDisplay)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.DisabledDisplay)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.OnTriggerDisplay)
                  .Include(e => e.Effects)
                      .ThenInclude(p => p.TriggeredDisplay)
                  .Include(e => e.Adventure)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return entity.ToModel(includeParent: true);
    }

    public async Task AddAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default) {
        var entity = encounter.ToEntity(adventureId);
        await context.Encounters.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task AddAsync(Encounter encounter, CancellationToken ct = default) {
        var entity = encounter.ToEntity(encounter.Adventure.Id);
        await context.Encounters.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task<bool> UpdateAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default) {
        var entity = encounter.ToEntity(adventureId);
        context.Encounters.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> UpdateAsync(Encounter encounter, CancellationToken ct = default) {
        var entity = await context.Encounters
            .Include(s => s.Stage)
            .Include(s => s.Actors)
            .Include(s => s.Objects)
            .Include(s => s.Effects)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Id == encounter.Id, ct);

        if (entity is null)
            return false;

        entity.UpdateFrom(encounter);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var encounter = await context.Encounters.FindAsync([id], ct);
        if (encounter is null)
            return false;
        context.Encounters.RemoveRange(context.Encounters.Where(a => a.Id == id));
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<ushort> GetNextActorIndexAsync(Guid encounterId, CancellationToken ct = default) {
        var maxIndex = await context.Set<EncounterActorEntity>()
            .Where(a => a.EncounterId == encounterId)
            .MaxAsync(a => (ushort?)a.Index, ct);
        return (ushort)((maxIndex ?? 0) + 1);
    }

    public async Task<bool> AddActorAsync(Guid encounterId, EncounterActor actor, CancellationToken ct = default) {
        var encounter = await context.Encounters
                                     .Include(e => e.Stage)
                                     .FirstOrDefaultAsync(e => e.Id == encounterId, ct);
        if (encounter is null)
            return false;
        var grid = new Grid {
            Type = encounter.Stage.GridType,
            CellSize = encounter.Stage.GridCellSize,
            Offset = encounter.Stage.GridOffset,
            Scale = encounter.Stage.GridScale,
        };
        var entity = actor.ToEntity(encounterId, grid);
        await context.Set<EncounterActorEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> UpdateActorAsync(Guid encounterId, EncounterActor actor, CancellationToken ct = default) {
        var entity = await context.Set<EncounterActorEntity>()
                            .Include(a => a.Encounter)
                                .ThenInclude(e => e.Stage)
                        .FirstOrDefaultAsync(a => a.EncounterId == encounterId && a.Index == actor.Index, ct);
        if (entity is null)
            return false;
        var grid = new Grid {
            Type = entity.Encounter.Stage.GridType,
            CellSize = entity.Encounter.Stage.GridCellSize,
            Offset = entity.Encounter.Stage.GridOffset,
            Scale = entity.Encounter.Stage.GridScale,
        };
        entity.UpdateFrom(actor, grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteActorAsync(Guid encounterId, ushort index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterActorEntity>()
            .FirstOrDefaultAsync(a => a.EncounterId == encounterId && a.Index == index, ct);
        if (entity is null)
            return false;
        context.Set<EncounterActorEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<ushort> GetNextPropIndexAsync(Guid encounterId, CancellationToken ct = default) {
        var maxIndex = await context.Set<EncounterPropEntity>()
            .Where(p => p.EncounterId == encounterId)
            .MaxAsync(p => (ushort?)p.Index, ct);
        return (ushort)((maxIndex ?? 0) + 1);
    }

    public async Task<bool> AddObjectAsync(Guid encounterId, EncounterObject prop, CancellationToken ct = default) {
        var encounter = await context.Encounters.Include(e => e.Stage).FirstOrDefaultAsync(e => e.Id == encounterId, ct);
        if (encounter is null)
            return false;
        var grid = new Grid {
            Type = encounter.Stage.GridType,
            CellSize = encounter.Stage.GridCellSize,
            Offset = encounter.Stage.GridOffset,
            Scale = encounter.Stage.GridScale,
        };
        var entity = prop.ToEntity(encounterId, grid);
        await context.Set<EncounterPropEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> UpdateObjectAsync(Guid encounterId, EncounterObject prop, CancellationToken ct = default) {
        var entity = await context.Set<EncounterPropEntity>()
            .Include(p => p.Encounter)
                .ThenInclude(e => e.Stage)
            .FirstOrDefaultAsync(p => p.EncounterId == encounterId && p.Index == prop.Index, ct);
        if (entity is null)
            return false;
        var grid = new Grid {
            Type = entity.Encounter.Stage.GridType,
            CellSize = entity.Encounter.Stage.GridCellSize,
            Offset = entity.Encounter.Stage.GridOffset,
            Scale = entity.Encounter.Stage.GridScale,
        };
        entity.UpdateFrom(prop, grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeletePropAsync(Guid encounterId, ushort index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterPropEntity>()
            .FirstOrDefaultAsync(p => p.EncounterId == encounterId && p.Index == index, ct);
        if (entity is null)
            return false;
        context.Set<EncounterPropEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<ushort> GetNextEffectIndexAsync(Guid encounterId, CancellationToken ct = default) {
        var maxIndex = await context.Set<EncounterEffectEntity>()
            .Where(e => e.EncounterId == encounterId)
            .MaxAsync(e => (ushort?)e.Index, ct);
        return (ushort)((maxIndex ?? 0) + 1);
    }

    public async Task<bool> AddEffectAsync(Guid encounterId, EncounterEffect effect, CancellationToken ct = default) {
        var encounter = await context.Encounters.Include(e => e.Stage).FirstOrDefaultAsync(e => e.Id == encounterId, ct);
        if (encounter is null)
            return false;
        var grid = new Grid {
            Type = encounter.Stage.GridType,
            CellSize = encounter.Stage.GridCellSize,
            Offset = encounter.Stage.GridOffset,
            Scale = encounter.Stage.GridScale,
        };
        var entity = effect.ToEntity(encounterId, grid);
        await context.Set<EncounterEffectEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> UpdateEffectAsync(Guid encounterId, EncounterEffect effect, CancellationToken ct = default) {
        var entity = await context.Set<EncounterEffectEntity>()
            .Include(e => e.Encounter)
                .ThenInclude(e => e.Stage)
            .FirstOrDefaultAsync(e => e.EncounterId == encounterId && e.Index == effect.Index, ct);
        if (entity is null)
            return false;
        var grid = new Grid {
            Type = entity.Encounter.Stage.GridType,
            CellSize = entity.Encounter.Stage.GridCellSize,
            Offset = entity.Encounter.Stage.GridOffset,
            Scale = entity.Encounter.Stage.GridScale,
        };
        entity.UpdateFrom(effect, grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    public async Task<bool> DeleteEffectAsync(Guid encounterId, ushort index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterEffectEntity>()
            .FirstOrDefaultAsync(e => e.EncounterId == encounterId && e.Index == index, ct);
        if (entity is null)
            return false;
        context.Set<EncounterEffectEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    private static IQueryable<Entities.Encounter> ApplySearchFilters(
        IQueryable<Entities.Encounter> query,
        LibrarySearchFilter filter,
        Guid masterUserId) {
        if (!string.IsNullOrWhiteSpace(filter.Search)) {
            var search = filter.Search.ToLowerInvariant();
            query = query.Where(e =>
                (e.Name != null && e.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase)) ||
                (e.Name == null && e.Stage.Name.Contains(search, StringComparison.InvariantCultureIgnoreCase)) ||
                (e.Description != null && e.Description.Contains(search, StringComparison.InvariantCultureIgnoreCase)) ||
                (e.Description == null && e.Stage.Description.Contains(search, StringComparison.InvariantCultureIgnoreCase)));
        }

        if (filter.OwnerId.HasValue)
            query = query.Where(e => e.Adventure.OwnerId == filter.OwnerId.Value);

        if (!string.IsNullOrWhiteSpace(filter.OwnerType)) {
            query = filter.OwnerType.ToLowerInvariant() switch {
                "master" => query.Where(e => e.Adventure.OwnerId == masterUserId),
                "user" => query.Where(e => e.Adventure.OwnerId != masterUserId),
                _ => query,
            };
        }

        if (filter.IsPublished.HasValue)
            query = query.Where(e => e.IsPublished == filter.IsPublished.Value);

        return query;
    }

    private static IOrderedQueryable<Entities.Encounter> ApplySorting(
        IQueryable<Entities.Encounter> query,
        LibrarySearchFilter filter) {
        var sortBy = filter.SortBy?.ToLowerInvariant() ?? "name";
        var descending = filter.SortOrder?.ToLowerInvariant() == "desc";

        return sortBy switch {
            "name" => descending ? query.OrderByDescending(e => e.Name) : query.OrderBy(e => e.Name),
            _ => descending ? query.OrderByDescending(e => e.Name) : query.OrderBy(e => e.Name),
        };
    }
}
