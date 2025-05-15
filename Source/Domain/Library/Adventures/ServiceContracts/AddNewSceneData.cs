namespace VttTools.Library.Adventures.ServiceContracts;

/// <summary>
/// Data to create a new Scene template.
/// </summary>
public record AddNewSceneData
    : Data {
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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The scene name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The scene description cannot be null or empty.", nameof(Description));
        return result;
    }
}