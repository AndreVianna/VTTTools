namespace VttTools.Library.Adventures.ApiContracts;

public record CreateAdventureRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AdventureStyle Style { get; init; }
    public bool IsOneShot { get; init; }
    public Guid? CampaignId { get; init; }
    public Guid? BackgroundId { get; init; }
}