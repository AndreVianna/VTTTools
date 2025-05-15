namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to clone an existing Scene template.
/// </summary>
public record AddClonedSceneData
    : Data {
    /// <summary>
    /// The id of the Scene used as template for the new Scene.
    /// </summary>
    public Guid TemplateId { get; init; }

    /// <summary>
    /// New name for the Scene. If not set, the original name is used with " (Copy)" at the end.
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the scene name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the scene description cannot be null or empty.", nameof(Description));
        return result;
    }
}