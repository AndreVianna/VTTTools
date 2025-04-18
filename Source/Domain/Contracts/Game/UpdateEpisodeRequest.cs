namespace VttTools.Contracts.Game;

/// <summary>
/// Request to update an existing Episode template.
/// </summary>
public record UpdateEpisodeRequest : Request
{
    /// <summary>
    /// New name for the episode. If null or empty, name is unchanged.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// New visibility setting. If null, visibility is unchanged.
    /// </summary>
    public Visibility? Visibility { get; set; }
}