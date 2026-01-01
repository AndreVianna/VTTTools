namespace VttTools.Library.Campaigns.ApiContracts;

public record CreateCampaignRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundId { get; init; }
}