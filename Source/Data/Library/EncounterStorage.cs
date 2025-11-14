using EncounterRegionEntity = VttTools.Data.Library.Entities.EncounterRegion;
using EncounterSourceEntity = VttTools.Data.Library.Entities.EncounterSource;
using EncounterWallEntity = VttTools.Data.Library.Entities.EncounterWall;

namespace VttTools.Data.Library;

/// <summary>
/// EF Core storage implementation for Encounter entities.
/// </summary>
public class EncounterStorage(ApplicationDbContext context)
    : IEncounterStorage {
    /// <inheritdoc />
    public Task<Encounter[]> GetAllAsync(CancellationToken ct = default) {
        var query = context.Encounters
                  .Include(e => e.Background)
                  .Include(e => e.Sound)
                  .Include(e => e.EncounterAssets)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .Select(Mapper.AsEncounter);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public Task<Encounter[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default) {
        var query = context.Encounters
                  .Include(e => e.Background)
                  .Include(e => e.Sound)
                  .Include(e => e.EncounterAssets)
                  .Where(e => e.AdventureId == adventureId)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .Select(Mapper.AsEncounter);
        var result = query.ToArrayAsync(ct);
        return result;
    }

    /// <inheritdoc />
    public async Task<Encounter?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.Encounters
                  .Include(e => e.Background)
                  .Include(e => e.Sound)
                  .Include(e => e.EncounterAssets)
                    .ThenInclude(ea => ea.Asset)
                  .Include(e => e.Walls)
                  .Include(e => e.Regions)
                  .Include(e => e.Sources)
                  .Include(e => e.EncounterEffects)
                  .Include(e => e.Adventure)
                  .AsSplitQuery()
                  .AsNoTracking()
                  .FirstOrDefaultAsync(e => e.Id == id, ct);
        return entity.ToModel();
    }

    /// <inheritdoc />
    public async Task AddAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default) {
        var entity = encounter.ToEntity(adventureId);
        await context.Encounters.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task AddAsync(Encounter encounter, CancellationToken ct = default) {
        var entity = encounter.ToEntity(encounter.Adventure.Id);
        await context.Encounters.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default) {
        var entity = encounter.ToEntity(adventureId);
        context.Encounters.Update(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Encounter encounter, CancellationToken ct = default) {
        var entity = await context.Encounters
            .Include(s => s.EncounterAssets)
                .ThenInclude(s => s.Asset)
            .Include(s => s.Walls)
            .Include(s => s.Regions)
            .Include(s => s.Sources)
            .Include(s => s.EncounterEffects)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Id == encounter.Id, ct);

        if (entity == null)
            return false;

        entity.UpdateFrom(encounter);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateAsync(Guid id, EncounterAsset encounterAsset, CancellationToken ct = default) {
        var entity = await context.Encounters
            .Include(s => s.EncounterAssets)
                .ThenInclude(sa => sa.Asset)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Id == id, ct);
        if (entity == null)
            return false;
        var encounterAssetEntity = entity.EncounterAssets.FirstOrDefault(sa => sa.Index == encounterAsset.Index);
        if (encounterAssetEntity == null)
            return false;
        encounterAssetEntity.UpdateFrom(id, encounterAsset, entity.Grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var encounter = await context.Encounters.FindAsync([id], ct);
        if (encounter == null)
            return false;
        context.Encounters.RemoveRange(context.Encounters.Where(a => a.Id == id));
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<EncounterWall?> GetWallByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterWallEntity>()
            .Include(sb => sb.Encounter)
            .AsNoTracking()
            .FirstOrDefaultAsync(sb => sb.EncounterId == id && sb.Index == index, ct);
        return entity?.ToModel(entity.Encounter.Grid);
    }

    /// <inheritdoc />
    public async Task<bool> AddWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default) {
        var encounter = await context.Encounters.FindAsync([id], ct);
        if (encounter == null) return false;
        var entity = encounterWall.ToEntity(id, encounter.Grid);
        await context.Set<EncounterWallEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default) {
        var entity = await context.Set<EncounterWallEntity>()
            .Include(w => w.Encounter)
            .FirstOrDefaultAsync(sb => sb.EncounterId == id && sb.Index == encounterWall.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, encounterWall, entity.Encounter.Grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteWallAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterWallEntity>()
            .FirstOrDefaultAsync(sb => sb.EncounterId == id && sb.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<EncounterWallEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<EncounterRegion?> GetRegionByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterRegionEntity>()
            .Include(sr => sr.Encounter)
            .AsNoTracking()
            .FirstOrDefaultAsync(sr => sr.EncounterId == id && sr.Index == index, ct);
        return entity?.ToModel(entity.Encounter.Grid);
    }

    /// <inheritdoc />
    public async Task<bool> AddRegionAsync(Guid id, EncounterRegion encounterRegion, CancellationToken ct = default) {
        var encounter = await context.Encounters.FindAsync([id], ct);
        if (encounter == null) return false;
        var entity = encounterRegion.ToEntity(id, encounter.Grid);
        await context.Set<EncounterRegionEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateRegionAsync(Guid id, EncounterRegion encounterRegion, CancellationToken ct = default) {
        var entity = await context.Set<EncounterRegionEntity>()
            .Include(r => r.Encounter)
            .FirstOrDefaultAsync(sr => sr.EncounterId == id && sr.Index == encounterRegion.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, encounterRegion, entity.Encounter.Grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteRegionAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterRegionEntity>()
            .FirstOrDefaultAsync(sr => sr.EncounterId == id && sr.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<EncounterRegionEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<EncounterSource?> GetSourceByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterSourceEntity>()
            .Include(ss => ss.Encounter)
            .AsNoTracking()
            .FirstOrDefaultAsync(ss => ss.EncounterId == id && ss.Index == index, ct);
        return entity?.ToModel(entity.Encounter.Grid);
    }

    /// <inheritdoc />
    public async Task<bool> AddSourceAsync(Guid id, EncounterSource encounterSource, CancellationToken ct = default) {
        var encounter = await context.Encounters.FindAsync([id], ct);
        if (encounter == null) return false;
        var entity = encounterSource.ToEntity(id, encounter.Grid);
        await context.Set<EncounterSourceEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateSourceAsync(Guid id, EncounterSource encounterSource, CancellationToken ct = default) {
        var entity = await context.Set<EncounterSourceEntity>()
            .Include(s => s.Encounter)
            .FirstOrDefaultAsync(ss => ss.EncounterId == id && ss.Index == encounterSource.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, encounterSource, entity.Encounter.Grid);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteSourceAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterSourceEntity>()
            .FirstOrDefaultAsync(ss => ss.EncounterId == id && ss.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<EncounterSourceEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<EncounterOpening?> GetOpeningByIdAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterOpeningEntity>()
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.EncounterId == id && o.Index == index, ct);
        return entity?.ToModel();
    }

    /// <inheritdoc />
    public async Task<bool> AddOpeningAsync(Guid id, EncounterOpening encounterOpening, CancellationToken ct = default) {
        var encounter = await context.Encounters.FindAsync([id], ct);
        if (encounter == null) return false;

        var wallExists = await context.Set<EncounterWallEntity>()
            .AnyAsync(w => w.EncounterId == id && w.Index == encounterOpening.WallIndex, ct);
        if (!wallExists) return false;

        var entity = encounterOpening.ToEntity(id);
        await context.Set<EncounterOpeningEntity>().AddAsync(entity, ct);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> UpdateOpeningAsync(Guid id, EncounterOpening encounterOpening, CancellationToken ct = default) {
        var entity = await context.Set<EncounterOpeningEntity>()
            .FirstOrDefaultAsync(o => o.EncounterId == id && o.Index == encounterOpening.Index, ct);
        if (entity == null)
            return false;
        entity.UpdateFrom(id, encounterOpening);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteOpeningAsync(Guid id, uint index, CancellationToken ct = default) {
        var entity = await context.Set<EncounterOpeningEntity>()
            .FirstOrDefaultAsync(o => o.EncounterId == id && o.Index == index, ct);
        if (entity == null)
            return false;
        context.Set<EncounterOpeningEntity>().Remove(entity);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}