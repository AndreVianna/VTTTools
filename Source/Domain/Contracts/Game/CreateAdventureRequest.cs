namespace VttTools.Contracts.Game;

/// <inheritdoc />
public record CreateAdventureRequest
    : CreateTemplateRequest<Adventure> {
    /// <summary>
    /// The ID of the campaign to which this episode belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }
}