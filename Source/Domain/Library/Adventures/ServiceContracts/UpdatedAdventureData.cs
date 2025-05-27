namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to update an existing Adventure template.
/// </summary>
public record UpdatedAdventureData
    : Data {
    /// <summary>
    /// New campaign ID for the Adventure. If not set, campaign assignment is unchanged.
    /// </summary>
    public Optional<Guid?> CampaignId { get; init; }

    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New description for the Adventure. If not set, description is unchanged.
    /// </summary>
    public Optional<string> Description { get; init; }

    /// <summary>
    /// New type for the Adventure. If not set, type is unchanged.
    /// </summary>
    public Optional<AdventureType> Type { get; init; }

    /// <summary>
    /// New display configuration for the Adventure. If not set, the original display is unchanged.
    /// </summary>
    public Optional<Display> Display { get; init; }

    /// <summary>
    /// Indicates whether the Adventure is published (visible) or not (hidden).
    /// If not set, visibility status is unchanged.
    /// </summary>
    public Optional<bool> IsListed { get; init; }

    /// <summary>
    /// Indicates whether the Adventure is publicly accessible.
    /// If not set, public status is unchanged.
    /// </summary>
    public Optional<bool> IsPublic { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the adventure name cannot be null or empty.", nameof(Name));

        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the adventure description cannot be null or empty.", nameof(Description));

        return result;
    }
}