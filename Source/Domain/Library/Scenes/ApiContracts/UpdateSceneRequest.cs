namespace VttTools.Library.Scenes.ApiContracts;

/// <summary>
/// Request to update an existing Scene template.
/// </summary>
public record UpdateSceneRequest
    : Request {
    /// <summary>
    /// New adventure ID for the scene. If not set, adventure assignment is unchanged.
    /// </summary>
    public Optional<Guid> AdventureId { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
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