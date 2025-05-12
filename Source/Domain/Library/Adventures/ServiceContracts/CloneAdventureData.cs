namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to clone an existing Adventure template.
/// </summary>
public record CloneAdventureData
    : Data {
    public Optional<Guid> CampaignId { get; init; }

    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the adventure name cannot be null or empty.", nameof(Name));
        return result;
    }
}