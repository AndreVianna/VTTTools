namespace VttTools.Library.Scenes.ApiContracts;

/// <summary>
/// Request to clone an existing Scene template.
/// </summary>
public record CloneSceneRequest
    : Request {
    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// The ID of the adventure to which this scene belongs.
    /// </summary>
    public Optional<Guid> AdventureId { get; init; }
}