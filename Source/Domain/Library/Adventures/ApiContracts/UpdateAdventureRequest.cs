namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to update an existing Adventure template.
/// </summary>
public record UpdateAdventureRequest
    : Request {
    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    [MaxLength(128)]
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New description for the Adventure. If not set, description is unchanged.
    /// </summary>
    [MaxLength(1024)]
    public Optional<string> Description { get; init; }

    /// <summary>
    /// New type for the Adventure. If not set, type is unchanged.
    /// </summary>
    public Optional<AdventureType> Type { get; init; }

    /// <summary>
    /// New display configuration for the Adventure. If not set, the display is unchanged.
    /// </summary>
    public Optional<Display> Display { get; init; }

    /// <summary>
    /// Indicates whether the Adventure is published (visible) or not (hidden).
    /// If not set, visibility status is unchanged.
    /// </summary>
    public Optional<bool> IsPublished { get; init; }

    /// <summary>
    /// Indicates whether the Adventure is publicly accessible.
    /// If not set, public status is unchanged.
    /// </summary>
    public Optional<bool> IsPublic { get; init; }

    /// <summary>
    /// New campaign ID for the Adventure. If not set, campaign assignment is unchanged.
    /// </summary>
    public Optional<Guid?> CampaignId { get; init; }
}