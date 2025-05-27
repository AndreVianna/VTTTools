namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to create a new Adventure template.
/// </summary>
public record CreateAdventureRequest
    : Request {
    /// <summary>
    /// The name for the new Adventure.
    /// </summary>
    [Required]
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The description of the Adventure.
    /// </summary>
    [Required]
    [MaxLength(1024)]
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// The type of Adventure.
    /// </summary>
    public AdventureType Type { get; init; }

    /// <summary>
    /// The display configuration for this Adventure.
    /// </summary>
    public Display Display { get; init; } = new();

    /// <summary>
    /// The ID of the campaign to which this Adventure belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }
}