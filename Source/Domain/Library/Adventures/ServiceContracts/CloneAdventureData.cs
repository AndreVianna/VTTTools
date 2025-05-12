namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to clone an existing Adventure template.
/// </summary>
public record CloneAdventureData
    : Data {
    /// <summary>
    /// New campaign ID for the cloned Adventure.
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
    /// New image path for the cloned Adventure. If not set, original image path is copied.
    /// </summary>
    public Optional<string?> ImagePath { get; init; }

    /// <summary>
    /// Whether the cloned Adventure should be visible. Default is false (hidden).
    /// </summary>
    public Optional<bool> IsVisible { get; init; }

    /// <summary>
    /// Whether the cloned Adventure should be public. Default is false (private).
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