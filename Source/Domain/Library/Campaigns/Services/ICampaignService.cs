namespace VttTools.Library.Campaigns.Services;

public interface ICampaignService {
    Task<Campaign[]> GetCampaignsAsync(CancellationToken ct = default);
    Task<Campaign[]> GetCampaignsAsync(string filterDefinition, CancellationToken ct = default);
    Task<Campaign?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<Campaign>> CreateCampaignAsync(Guid userId, CreateCampaignData data, CancellationToken ct = default);
    Task<Result<Campaign>> CloneCampaignAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result<Campaign>> UpdateCampaignAsync(Guid userId, Guid id, UpdatedCampaignData data, CancellationToken ct = default);
    Task<Result> DeleteCampaignAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Adventure[]> GetAdventuresAsync(Guid id, CancellationToken ct = default);
    Task<Result<Adventure>> AddNewAdventureAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Result<Adventure>> AddClonedAdventureAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);
    Task<Result> RemoveAdventureAsync(Guid userId, Guid id, Guid adventureId, CancellationToken ct = default);
}