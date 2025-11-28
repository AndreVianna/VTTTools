namespace VttTools.Domain.Admin.Services;

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
}
