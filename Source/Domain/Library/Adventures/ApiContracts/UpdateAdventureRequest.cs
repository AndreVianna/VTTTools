namespace VttTools.Library.Adventures.ApiContracts;

public record UpdateAdventureRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<AdventureStyle> Style { get; init; }
    public Optional<bool> IsOneShot { get; init; }
    public Optional<Guid?> BackgroundId { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }
    public Optional<Guid?> CampaignId { get; init; }
}