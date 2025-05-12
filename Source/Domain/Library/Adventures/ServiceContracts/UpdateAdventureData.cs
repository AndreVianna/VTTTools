namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to update an existing Adventure template.
/// </summary>
public record UpdateAdventureData
    : Data {
    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New visibility setting for the Adventure. If not set, visibility is unchanged.
    /// </summary>
    public Optional<Visibility> Visibility { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the adventure name cannot be null or empty.", nameof(Name));
        return result;
    }
}