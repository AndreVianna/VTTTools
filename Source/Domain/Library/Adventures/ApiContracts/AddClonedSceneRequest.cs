namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to clone an existing Scene and add to the Adventure template.
/// </summary>
public record AddClonedSceneRequest
    : Request {
    /// <summary>
    /// The id of the Scene to be cloned.
    /// </summary>
    public Guid SceneId { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, use the scene name.
    /// </summary>
    public Optional<string> Name { get; init; }
}