namespace VttTools.Admin.Library.Services;

public interface IAdventureAdminService {
    Task<LibraryContentSearchResponse> SearchAdventuresAsync(LibrarySearchRequest request, CancellationToken ct = default);
    Task<LibraryContentResponse?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateAdventureAsync(string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> UpdateAdventureAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);
    Task DeleteAdventureAsync(Guid id, CancellationToken ct = default);
    Task TransferAdventureOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<LibraryContentResponse>> GetEncountersByAdventureIdAsync(Guid adventureId, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateEncounterForAdventureAsync(Guid adventureId, string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> CloneEncounterAsync(Guid adventureId, Guid encounterId, string? newName, CancellationToken ct = default);
    Task RemoveEncounterFromAdventureAsync(Guid adventureId, Guid encounterId, CancellationToken ct = default);
}