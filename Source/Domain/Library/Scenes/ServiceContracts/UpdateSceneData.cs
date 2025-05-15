namespace VttTools.Library.Scenes.ServiceContracts;

/// <summary>
/// Data to update an existing Scene template.
/// </summary>
public record UpdateSceneData
    : Data {
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the scene name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the scene description cannot be null or empty.", nameof(Description));
        return result;
    }
}