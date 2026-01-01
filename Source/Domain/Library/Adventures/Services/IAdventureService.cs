namespace VttTools.Library.Adventures.Services;

public interface IAdventureService {
    Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default);
    Task<Adventure[]> GetAdventuresAsync(string filterDefinition, CancellationToken ct = default);
    Task<Adventure?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Adventure>> CreateAdventureAsync(Guid userId, CreateAdventureData data, CancellationToken ct = default);
    Task<Result<Adventure>> CloneAdventureAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result<Adventure>> UpdateAdventureAsync(Guid userId, Guid id, UpdatedAdventureData data, CancellationToken ct = default);
    Task<Result> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Encounter[]> GetEncountersAsync(Guid id, CancellationToken ct = default);
    Task<Result<Encounter>> AddNewEncounterAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Result<Encounter>> AddClonedEncounterAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);
    Task<Result> RemoveEncounterAsync(Guid userId, Guid id, Guid encounterId, CancellationToken ct = default);
}
