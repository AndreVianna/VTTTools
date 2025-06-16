namespace VttTools.Library.Adventures.ApiContracts;

public record CreateAdventureRequest
    : Request {
    [Required]
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [Required]
    [MaxLength(1024)]
    public string Description { get; init; } = string.Empty;
    public AdventureType Type { get; init; }
    public Guid? CampaignId { get; init; }
    public Guid? BackgroundId { get; init; }
}