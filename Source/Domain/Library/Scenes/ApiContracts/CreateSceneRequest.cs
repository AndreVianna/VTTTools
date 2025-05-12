namespace VttTools.Library.Scenes.ApiContracts;

/// <summary>
/// Request to create a new Scene template.
/// </summary>
public record CreateSceneRequest
    : Request {
    /// <summary>
    /// The name for the new Scene. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new Scene. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }
}