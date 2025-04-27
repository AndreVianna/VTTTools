namespace VttTools.Contracts.Game;

/// <inheritdoc />
public record CloneAdventureRequest
    : CloneTemplateRequest<Adventure> {
    /// <summary>
    /// The ID of the campaign to which this adventure belongs.
    /// </summary>
    public Optional<Guid> CampaignId { get; init; }
}