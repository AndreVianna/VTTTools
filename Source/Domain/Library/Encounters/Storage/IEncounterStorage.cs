namespace VttTools.Library.Encounters.Storage;

public interface IEncounterStorage {
    Task<(Encounter[] Items, int TotalCount)> SearchAsync(
        Guid masterUserId,
        LibrarySearchFilter filter,
        CancellationToken ct = default);

    Task<Encounter[]> GetAllAsync(CancellationToken ct = default);

    Task<Encounter[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default);

    Task<Encounter?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task AddAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default);

    Task AddAsync(Encounter encounter, CancellationToken ct = default);

    Task<bool> UpdateAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default);

    Task<bool> UpdateAsync(Encounter encounter, CancellationToken ct = default);

    Task<bool> UpdateAsync(Guid id, EncounterAsset encounterAsset, CancellationToken ct = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    Task<bool> AddWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default);

    Task<bool> UpdateWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default);

    Task<bool> DeleteWallAsync(Guid id, uint index, CancellationToken ct = default);

    Task<bool> AddRegionAsync(Guid id, EncounterRegion encounterRegion, CancellationToken ct = default);

    Task<bool> UpdateRegionAsync(Guid id, EncounterRegion encounterRegion, CancellationToken ct = default);

    Task<bool> DeleteRegionAsync(Guid id, uint index, CancellationToken ct = default);

    Task<bool> AddLightSourceAsync(Guid id, EncounterLight lightSource, CancellationToken ct = default);

    Task<bool> UpdateLightSourceAsync(Guid id, EncounterLight lightSource, CancellationToken ct = default);

    Task<bool> DeleteLightSourceAsync(Guid id, uint index, CancellationToken ct = default);

    Task<bool> AddSoundSourceAsync(Guid id, EncounterSound soundSource, CancellationToken ct = default);

    Task<bool> UpdateSoundSourceAsync(Guid id, EncounterSound soundSource, CancellationToken ct = default);

    Task<bool> DeleteSoundSourceAsync(Guid id, uint index, CancellationToken ct = default);
}