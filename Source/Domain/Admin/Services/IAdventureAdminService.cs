namespace VttTools.Domain.Admin.Services;

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
}
