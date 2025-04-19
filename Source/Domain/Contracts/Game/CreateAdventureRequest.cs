namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Adventure template.
/// </summary>
public record CreateAdventureRequest
    : Request {
    /// <summary>
    /// The name of the adventure.
    /// </summary>
    [Required]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Visibility for the new adventure.
    /// </summary>
    public Visibility Visibility { get; init; } = Visibility.Hidden;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Adventure name cannot be empty.", nameof(Name));
        return result;
    }
}