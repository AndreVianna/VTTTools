namespace VttTools.Library.Scenes.ApiContracts;

/// <inheritdoc />
public record CloneSceneRequest
    : CloneTemplateRequest<Scene> {
    /// <summary>
    /// The ID of the adventure to which this scene belongs.
    /// </summary>
    public Optional<Guid> AdventureId { get; init; }
}