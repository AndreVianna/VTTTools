namespace VttTools.Domain.Admin.Services;

public interface IEncounterAdminService {
    Task<LibraryContentSearchResponse> SearchEncountersAsync(LibrarySearchRequest request, CancellationToken ct = default);
    Task<LibraryContentResponse?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateEncounterAsync(string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> UpdateEncounterAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        CancellationToken ct = default);
    Task DeleteEncounterAsync(Guid id, CancellationToken ct = default);
    Task TransferEncounterOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);
}