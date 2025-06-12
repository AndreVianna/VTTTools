namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to clone an existing Adventure template.
/// </summary>
public record ClonedAdventureData
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
    /// New display configuration for the Adventure. If not set, the display is unchanged.
    /// </summary>
    public Optional<Resource> Display { get; init; }

    /// <summary>
    /// The id of the Adventure used as template for the new Adventure.
    /// </summary>
    public Guid TemplateId { get; init; }

    /// <summary>
    /// Whether the clone action should also clone the scenes.
    /// </summary>
    public bool IncludeScenes { get; init; } = true;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the adventure name cannot be null or empty.", nameof(Name));

        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the adventure description cannot be null or empty.", nameof(Description));

        return result;
    }
}