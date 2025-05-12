namespace VttTools.Library.Scenes.ServiceContracts;

/// <summary>
/// Data to create a new Scene template.
/// </summary>
public record CreateSceneData
    : Data {
    /// <summary>
    /// The name for the new Scene. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new Scene. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The scene name cannot be null or empty.", nameof(Name));
        return result;
    }
}