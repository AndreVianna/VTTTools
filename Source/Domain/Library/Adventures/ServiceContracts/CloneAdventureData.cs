namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to clone an existing Adventure template.
/// </summary>
public record CloneAdventureData
    : Data {
    /// <summary>
    /// The id of the Adventure used as template for the new Adventure.
    /// </summary>
    public Guid TemplateId { get; init; }

    /// <summary>
    /// The id of the Campaign to which the new Adventure belongs. If not set, the original Campaign is used.
    /// </summary>
    public Optional<Guid?> CampaignId { get; init; }

    /// <summary>
    /// New name for the cloned Adventure. If not set, original name + " (Copy)" is used.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New description for the cloned Adventure. If not set, original description is copied.
    /// </summary>
    public Optional<string> Description { get; init; }

    /// <summary>
    /// New type for the cloned Adventure. If not set, original type is copied.
    /// </summary>
    public Optional<AdventureType> Type { get; init; }

    /// <summary>
    /// New image id for the cloned Adventure. If not set, original image id is copied.
    /// </summary>
    public Optional<Guid?> ImageId { get; init; }

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