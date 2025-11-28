namespace VttTools.Domain.Admin.Services;

public interface IWorldAdminService {
    Task<LibraryContentSearchResponse> SearchWorldsAsync(LibrarySearchRequest request, CancellationToken ct = default);
    Task<LibraryContentResponse?> GetWorldByIdAsync(Guid id, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateWorldAsync(string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> UpdateWorldAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);
    Task DeleteWorldAsync(Guid id, CancellationToken ct = default);
    Task TransferWorldOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<LibraryContentResponse>> GetCampaignsByWorldIdAsync(Guid worldId, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateCampaignForWorldAsync(Guid worldId, string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> CloneCampaignAsync(Guid worldId, Guid campaignId, string? newName, CancellationToken ct = default);
    Task RemoveCampaignFromWorldAsync(Guid worldId, Guid campaignId, CancellationToken ct = default);
}
