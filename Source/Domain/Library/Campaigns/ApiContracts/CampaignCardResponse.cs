namespace VttTools.Library.Campaigns.ApiContracts;

public record CampaignCardResponse {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
    public int AdventureCount { get; init; }
    public Guid? BackgroundId { get; init; }

    public static CampaignCardResponse FromCampaign(Campaign campaign) => new() {
        Id = campaign.Id,
        Name = campaign.Name,
        Description = campaign.Description,
        IsPublished = campaign.IsPublished,
        IsPublic = campaign.IsPublic,
        AdventureCount = campaign.Adventures.Count,
        BackgroundId = campaign.Background?.Id,
    };
}
