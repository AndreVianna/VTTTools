namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to clone an existing Scene and add to the Adventure template.
/// </summary>
public record AddClonedSceneRequest
    : Request {
    /// <summary>
    /// The id of the Scene to be cloned.
    /// </summary>
    public Guid TemplateId { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, use the scene name.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, the original description is unchanged.
    /// </summary>
    public Optional<string> Description { get; init; }

    /// <summary>
    /// New stage configuration. If not set, the original stage is unchanged.
    /// </summary>
    public Optional<Stage> Stage { get; init; }
}