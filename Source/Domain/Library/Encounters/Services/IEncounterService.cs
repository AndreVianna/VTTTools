using AddActorData = VttTools.Library.Encounters.ServiceContracts.EncounterActorAddData;
using AddEffectData = VttTools.Library.Encounters.ServiceContracts.EncounterEffectAddData;
using AddPropData = VttTools.Library.Encounters.ServiceContracts.EncounterObjectAddData;
using UpdateActorData = VttTools.Library.Encounters.ServiceContracts.EncounterActorUpdateData;
using UpdateEffectData = VttTools.Library.Encounters.ServiceContracts.EncounterEffectUpdateData;
using UpdatePropData = VttTools.Library.Encounters.ServiceContracts.EncounterObjectUpdateData;

namespace VttTools.Library.Encounters.Services;

public interface IEncounterService {
    Task<Encounter[]> GetAllAsync(CancellationToken ct = default);
    Task<Encounter?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Encounter>> CreateAsync(Guid userId, CreateEncounterData data, CancellationToken ct = default);
    Task<Result> UpdateAsync(Guid userId, Guid id, EncounterUpdateData data, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<EncounterActor[]> GetActorsAsync(Guid encounterId, CancellationToken ct = default);
    Task<Result<EncounterActor>> AddActorAsync(Guid userId, Guid encounterId, Guid assetId, AddActorData data, CancellationToken ct = default);
    Task<Result> UpdateActorAsync(Guid userId, Guid encounterId, ushort index, UpdateActorData data, CancellationToken ct = default);
    Task<Result> RemoveActorAsync(Guid userId, Guid encounterId, ushort index, CancellationToken ct = default);

    Task<EncounterObject[]> GetObjectsAsync(Guid encounterId, CancellationToken ct = default);
    Task<Result<EncounterObject>> AddObjectAsync(Guid userId, Guid encounterId, Guid assetId, AddPropData data, CancellationToken ct = default);
    Task<Result> UpdateObjectAsync(Guid userId, Guid encounterId, ushort index, UpdatePropData data, CancellationToken ct = default);
    Task<Result> RemoveObjectAsync(Guid userId, Guid encounterId, ushort index, CancellationToken ct = default);

    Task<EncounterEffect[]> GetEffectsAsync(Guid encounterId, CancellationToken ct = default);
    Task<Result<EncounterEffect>> AddEffectAsync(Guid userId, Guid encounterId, Guid assetId, AddEffectData data, CancellationToken ct = default);
    Task<Result> UpdateEffectAsync(Guid userId, Guid encounterId, ushort index, UpdateEffectData data, CancellationToken ct = default);
    Task<Result> RemoveEffectAsync(Guid userId, Guid encounterId, ushort index, CancellationToken ct = default);
}