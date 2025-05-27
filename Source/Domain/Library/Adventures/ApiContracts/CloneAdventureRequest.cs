namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to clone an existing Adventure template.
/// </summary>
public record CloneAdventureRequest
    : Request {
    /// <summary>
    /// Campaign ID for the Adventure. If not set, the adventure is not associated with a campaign.
    /// </summary>
    public Optional<Guid?> CampaignId { get; init; }

    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// Description for the Adventure. If not set, description is copied from source.
    /// </summary>
    public Optional<string> Description { get; init; }

    /// <summary>
    /// Type of Adventure. If not set, type is copied from source.
    /// </summary>
    public Optional<AdventureType> Type { get; init; }

    /// <summary>
    /// Stage configuration for the Adventure. If not set, the display is copied from source.
    /// </summary>
    public Optional<Display> Display { get; init; }

    /// <summary>
    /// Whether the Adventure is visible. Default is false.
    /// </summary>
    public Optional<bool> IsListed { get; init; }

    /// <summary>
    /// Whether the Adventure is public. Default is false.
    /// </summary>
    public Optional<bool> IsPublic { get; init; }

    /// <summary>
    /// Whether the clone action should also clone the scenes.
    /// </summary>
    public bool IncludeScenes { get; init; } = true;
}