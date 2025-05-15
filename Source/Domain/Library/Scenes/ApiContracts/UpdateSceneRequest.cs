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
    /// New stage configuration. If not set, the original stage is unchanged.
    /// </summary>
    public Optional<Stage> Stage { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
    /// </summary>
    public Optional<bool> IsListed { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
    /// </summary>
    public Optional<bool> IsPublic { get; init; }
}