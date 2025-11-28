namespace VttTools.Domain.Admin.Services;

public interface IAssetAdminService {
    Task<LibraryContentSearchResponse> SearchAssetsAsync(LibrarySearchRequest request, CancellationToken ct = default);
    Task<LibraryContentResponse?> GetAssetByIdAsync(Guid id, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateAssetAsync(string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> UpdateAssetAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);
    Task DeleteAssetAsync(Guid id, CancellationToken ct = default);
    Task TransferAssetOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);
}
