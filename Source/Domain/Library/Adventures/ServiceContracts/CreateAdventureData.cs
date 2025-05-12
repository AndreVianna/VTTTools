namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to create a new Adventure template.
/// </summary>
public record CreateAdventureData
    : Data {
    /// <summary>
    /// The ID of the campaign to which this adventure belongs.
    /// </summary>
    public Guid? CampaignId { get; init; }

    /// <summary>
    /// The name for the new Adventure. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new Adventure. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The adventure name cannot be null or empty.", nameof(Name));
        return result;
    }
}