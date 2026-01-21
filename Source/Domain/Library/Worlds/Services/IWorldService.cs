namespace VttTools.Library.Worlds.Services;

public interface IWorldService {
    Task<World[]> GetWorldsAsync(CancellationToken ct = default);
    Task<World[]> GetWorldsAsync(string filterDefinition, CancellationToken ct = default);
    Task<World?> GetWorldByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<World>> CreateWorldAsync(Guid userId, CreateWorldData data, CancellationToken ct = default);
    Task<Result<World>> CloneWorldAsync(Guid userId, Guid templateId, CancellationToken ct = default);
    Task<Result<World>> UpdateWorldAsync(Guid userId, Guid id, UpdatedWorldData data, CancellationToken ct = default);
    Task<Result> DeleteWorldAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Campaign[]> GetCampaignsAsync(Guid id, CancellationToken ct = default);
    Task<Result<Campaign>> AddNewCampaignAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<Result<Campaign>> AddClonedCampaignAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default);
    Task<Result> RemoveCampaignAsync(Guid userId, Guid id, Guid campaignId, CancellationToken ct = default);
}