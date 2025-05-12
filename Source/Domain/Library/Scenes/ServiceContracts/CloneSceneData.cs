namespace VttTools.Library.Scenes.ServiceContracts;

/// <summary>
/// Data to clone an existing Scene template.
/// </summary>
public record CloneSceneData
    : Data {
    /// <summary>
    /// New name for the Scene. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// The ID of the scene to which this scene belongs.
    /// </summary>
    public Optional<Guid> SceneId { get; init; }
    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the scene name cannot be null or empty.", nameof(Name));
        return result;
    }
}