namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Episode template under an Adventure.
/// </summary>
public record CreateEpisodeRequest : Request
{
    /// <summary>
    /// Name of the new episode.
    /// </summary>
    [Required]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Visibility setting for the new episode.
    /// </summary>
    public Visibility Visibility { get; init; } = Visibility.Hidden;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Episode name cannot be empty.", nameof(Name));
        return result;
    }
}