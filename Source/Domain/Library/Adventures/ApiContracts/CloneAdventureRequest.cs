namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to clone an existing Adventure template.
/// </summary>
public record CloneAdventureRequest
    : Request {
    public Optional<Guid> CampaignId { get; init; }

    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }
}