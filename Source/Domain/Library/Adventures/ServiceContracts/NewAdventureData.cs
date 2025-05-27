namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to create a new Adventure template.
/// </summary>
public record NewAdventureData
    : Data {
    /// <summary>
    /// The ID of the campaign to which this adventure belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }

    /// <summary>
    /// The name for the new Adventure.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The description of the Adventure.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// The type of Adventure.
    /// </summary>
    public AdventureType Type { get; init; }

    /// <summary>
    /// The display configuration for this Adventure.
    /// </summary>
    public Display Display { get; init; } = new();

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The adventure name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The adventure description cannot be null or empty.", nameof(Description));
        return result;
    }
}