namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Adventure template.
/// </summary>
public record CreateAdventureRequest : Request
{
    [Required]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Visibility for the new adventure.
    /// </summary>
    public Visibility Visibility { get; init; } = Visibility.Hidden;
}