namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to clone an existing Scene and add to the Adventure template.
/// </summary>
public record CloneSceneRequest
    : Request {
    /// <summary>
    /// New name for the Scene. If not set, use the scene name.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, the original description is unchanged.
    /// </summary>
    public Optional<string> Description { get; init; }

    /// <summary>
    /// New display configuration. If not set, the original display is unchanged.
    /// </summary>
    public Optional<Display> Display { get; init; }

    /// <summary>
    /// New zoom level configuration. If not set, the original zoom level is unchanged.
    /// </summary>
    public Optional<float> ZoomLevel { get; init; }

    /// <summary>
    /// New grid configuration. If not set, the original grid is unchanged.
    /// </summary>
    public Optional<Grid> Grid { get; init; }
}