namespace VttTools.Admin.Library.Services;

public interface ICampaignAdminService {
    Task<LibraryContentSearchResponse> SearchCampaignsAsync(LibrarySearchRequest request, CancellationToken ct = default);
    Task<LibraryContentResponse?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateCampaignAsync(string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> UpdateCampaignAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);
    Task DeleteCampaignAsync(Guid id, CancellationToken ct = default);
    Task TransferCampaignOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<LibraryContentResponse>> GetAdventuresByCampaignIdAsync(Guid campaignId, CancellationToken ct = default);
    Task<LibraryContentResponse> CreateAdventureForCampaignAsync(Guid campaignId, string name, string description, CancellationToken ct = default);
    Task<LibraryContentResponse> CloneAdventureAsync(Guid campaignId, Guid adventureId, string? newName, CancellationToken ct = default);
    Task RemoveAdventureFromCampaignAsync(Guid campaignId, Guid adventureId, CancellationToken ct = default);
}