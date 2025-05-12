namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to create a new Adventure template.
/// </summary>
public record CreateAdventureRequest
    : Request {
    /// <summary>
    /// The name for the new Adventure. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new Adventure. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }

    /// <summary>
    /// The ID of the campaign to which this scene belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }
}