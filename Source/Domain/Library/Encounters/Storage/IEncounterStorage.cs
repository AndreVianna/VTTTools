namespace VttTools.Library.Encounters.Storage;

/// <summary>
/// Storage interface for Encounter entities.
/// </summary>
public interface IEncounterStorage {
    /// <summary>
    /// Retrieves all encounters
    /// </summary>
    Task<Encounter[]> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves all encounters
    /// </summary>
    Task<Encounter[]> GetByParentIdAsync(Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter by its ID.
    /// </summary>
    Task<Encounter?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new encounter to an adventure.
    /// </summary>
    Task AddAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new standalone encounter template.
    /// </summary>
    Task AddAsync(Encounter encounter, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing encounter associated to an adventure.
    /// </summary>
    Task<bool> UpdateAsync(Encounter encounter, Guid adventureId, CancellationToken ct = default);

    /// <summary>
    /// Updates a standalone encounter template.
    /// </summary>
    Task<bool> UpdateAsync(Encounter encounter, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter asset.
    /// </summary>
    Task<bool> UpdateAsync(Guid id, EncounterAsset encounterAsset, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter template.
    /// </summary>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter WallIndex by its ID.
    /// </summary>
    Task<EncounterWall?> GetWallByKeyAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter WallIndex to a encounter.
    /// </summary>
    Task<bool> AddWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter WallIndex.
    /// </summary>
    Task<bool> UpdateWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter WallIndex.
    /// </summary>
    Task<bool> DeleteWallAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter region by its ID.
    /// </summary>
    Task<EncounterRegion?> GetRegionByKeyAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter region to a encounter.
    /// </summary>
    Task<bool> AddRegionAsync(Guid id, EncounterRegion encounterRegion, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter region.
    /// </summary>
    Task<bool> UpdateRegionAsync(Guid id, EncounterRegion encounterRegion, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter region.
    /// </summary>
    Task<bool> DeleteRegionAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter light source by its ID.
    /// </summary>
    Task<EncounterLight?> GetLightSourceByKeyAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter light source to a encounter.
    /// </summary>
    Task<bool> AddLightSourceAsync(Guid id, EncounterLight lightSource, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter light source.
    /// </summary>
    Task<bool> UpdateLightSourceAsync(Guid id, EncounterLight lightSource, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter light source.
    /// </summary>
    Task<bool> DeleteLightSourceAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter sound source by its ID.
    /// </summary>
    Task<EncounterSound?> GetSoundSourceByKeyAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter sound source to a encounter.
    /// </summary>
    Task<bool> AddSoundSourceAsync(Guid id, EncounterSound soundSource, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter sound source.
    /// </summary>
    Task<bool> UpdateSoundSourceAsync(Guid id, EncounterSound soundSource, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter sound source.
    /// </summary>
    Task<bool> DeleteSoundSourceAsync(Guid id, uint index, CancellationToken ct = default);
}