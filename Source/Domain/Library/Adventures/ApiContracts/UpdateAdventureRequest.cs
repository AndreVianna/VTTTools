namespace VttTools.Library.Adventures.ApiContracts;

public record UpdateAdventureRequest
    : Request {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }
    [MaxLength(1024)]
    public Optional<string> Description { get; init; }
    public Optional<AdventureType> Type { get; init; }
    public Optional<Guid> BackgroundId { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }
    public Optional<Guid?> CampaignId { get; init; }
}