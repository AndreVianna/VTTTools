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

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name is not null && (Name.Length == 0 || Name.All(char.IsWhiteSpace)))
            result += new Error("Episode name cannot be empty.", nameof(Name));
        return result;
    }
}