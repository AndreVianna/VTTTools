namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to clone an existing Scene and add to the Adventure template.
/// </summary>
public record AddClonedSceneData
    : Data {
    /// <summary>
    /// The id of the Scene to be cloned.
    /// </summary>
    public Guid SceneId { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, use the original scene name.
    /// </summary>
    public Optional<string> Name { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the scene name cannot be null or empty.", nameof(Name));
        return result;
    }
}