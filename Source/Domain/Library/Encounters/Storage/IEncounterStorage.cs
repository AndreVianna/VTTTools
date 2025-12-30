namespace VttTools.Library.Encounters.Storage;

/// <summary>
/// Storage interface for encounter persistence operations.
/// Note: Structural elements (walls, regions, lights, elements, sounds) are now managed on Stage.
/// </summary>
public interface IEncounterStorage {
    // === Encounter Operations ===

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

    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    // === Game Element Operations ===

    // Actors
    Task<ushort> GetNextActorIndexAsync(Guid encounterId, CancellationToken ct = default);
    Task<bool> AddActorAsync(Guid encounterId, EncounterActor actor, CancellationToken ct = default);
    Task<bool> UpdateActorAsync(Guid encounterId, EncounterActor actor, CancellationToken ct = default);
    Task<bool> DeleteActorAsync(Guid encounterId, ushort index, CancellationToken ct = default);

    // Objects
    Task<ushort> GetNextPropIndexAsync(Guid encounterId, CancellationToken ct = default);
    Task<bool> AddObjectAsync(Guid encounterId, EncounterObject prop, CancellationToken ct = default);
    Task<bool> UpdateObjectAsync(Guid encounterId, EncounterObject prop, CancellationToken ct = default);
    Task<bool> DeletePropAsync(Guid encounterId, ushort index, CancellationToken ct = default);

    // Effects (unified - includes traps as hazardous effects)
    Task<ushort> GetNextEffectIndexAsync(Guid encounterId, CancellationToken ct = default);
    Task<bool> AddEffectAsync(Guid encounterId, EncounterEffect effect, CancellationToken ct = default);
    Task<bool> UpdateEffectAsync(Guid encounterId, EncounterEffect effect, CancellationToken ct = default);
    Task<bool> DeleteEffectAsync(Guid encounterId, ushort index, CancellationToken ct = default);
}