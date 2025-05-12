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
    public AdventureType Type { get; init; } = AdventureType.OpenWorld;

    /// <summary>
    /// Path to the Adventure's image.
    /// </summary>
    [MaxLength(512)]
    public string? ImagePath { get; init; }

    /// <summary>
    /// Indicates whether the Adventure is published (visible) or not (hidden).
    /// </summary>
    public bool IsVisible { get; init; }

    /// <summary>
    /// Indicates whether the Adventure is publicly accessible.
    /// </summary>
    public bool IsPublic { get; init; }

    /// <summary>
    /// The ID of the campaign to which this Adventure belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }
}