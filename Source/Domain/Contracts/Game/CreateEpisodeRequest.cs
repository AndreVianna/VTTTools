namespace VttTools.Contracts.Game;

using System.ComponentModel.DataAnnotations;
using VttTools.Model.Game;

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
}