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
    /// Retrieves a encounter Wall by its ID.
    /// </summary>
    Task<EncounterWall?> GetWallByIdAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter Wall to a encounter.
    /// </summary>
    Task<bool> AddWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter Wall.
    /// </summary>
    Task<bool> UpdateWallAsync(Guid id, EncounterWall encounterWall, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter Wall.
    /// </summary>
    Task<bool> DeleteWallAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter region by its ID.
    /// </summary>
    Task<EncounterRegion?> GetRegionByIdAsync(Guid id, uint index, CancellationToken ct = default);

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
    /// Retrieves a encounter source by its ID.
    /// </summary>
    Task<EncounterSource?> GetSourceByIdAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter source to a encounter.
    /// </summary>
    Task<bool> AddSourceAsync(Guid id, EncounterSource encounterSource, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter source.
    /// </summary>
    Task<bool> UpdateSourceAsync(Guid id, EncounterSource encounterSource, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter source.
    /// </summary>
    Task<bool> DeleteSourceAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Retrieves a encounter opening by its ID.
    /// </summary>
    Task<EncounterOpening?> GetOpeningByIdAsync(Guid id, uint index, CancellationToken ct = default);

    /// <summary>
    /// Adds a encounter opening to a encounter.
    /// </summary>
    Task<bool> AddOpeningAsync(Guid id, EncounterOpening encounterOpening, CancellationToken ct = default);

    /// <summary>
    /// Updates a encounter opening.
    /// </summary>
    Task<bool> UpdateOpeningAsync(Guid id, EncounterOpening encounterOpening, CancellationToken ct = default);

    /// <summary>
    /// Deletes a encounter opening.
    /// </summary>
    Task<bool> DeleteOpeningAsync(Guid id, uint index, CancellationToken ct = default);
}