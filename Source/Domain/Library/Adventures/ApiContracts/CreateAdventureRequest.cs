namespace VttTools.Library.Adventures.ApiContracts;

/// <inheritdoc />
public record CreateAdventureRequest
    : CreateTemplateRequest<Adventure> {
    /// <summary>
    /// The ID of the campaign to which this scene belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }
}