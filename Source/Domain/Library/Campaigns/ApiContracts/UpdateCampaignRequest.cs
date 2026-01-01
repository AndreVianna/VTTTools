namespace VttTools.Library.Campaigns.ApiContracts;

public record UpdateCampaignRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid?> BackgroundId { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }
}