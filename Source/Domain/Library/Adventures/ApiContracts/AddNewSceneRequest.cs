namespace VttTools.Library.Adventures.ApiContracts;

/// <summary>
/// Request to create a new Scene template.
/// </summary>
public record AddNewSceneRequest
    : Request {
    /// <summary>
    /// The name for the new Scene.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The description of the Scene.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// New stage setup.
    /// </summary>
    public Stage Stage { get; init; } = new();
}