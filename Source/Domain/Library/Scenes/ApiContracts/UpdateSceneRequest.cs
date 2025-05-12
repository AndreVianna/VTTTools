namespace VttTools.Library.Scenes.ApiContracts;

/// <summary>
/// Request to update an existing Scene template.
/// </summary>
public record UpdateSceneRequest
    : Request {
    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New visibility setting for the Scene. If not set, visibility is unchanged.
    /// </summary>
    public Optional<Visibility> Visibility { get; set; }
}