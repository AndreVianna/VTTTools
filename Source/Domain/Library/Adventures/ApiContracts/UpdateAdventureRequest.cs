namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to update an existing Adventure template.
/// </summary>
public record UpdateAdventureRequest
    : Request {
    /// <summary>
    /// New name for the Adventure. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New visibility setting for the Adventure. If not set, visibility is unchanged.
    /// </summary>
    public Optional<Visibility> Visibility { get; set; }
}