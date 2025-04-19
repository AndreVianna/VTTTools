namespace VttTools.Contracts.Game;

/// <summary>
/// Request to update an existing Adventure template.
/// </summary>
public record UpdateAdventureRequest : Request {
    /// <summary>
    /// New name for the adventure. If null, name is unchanged.
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// New visibility setting. If null, visibility is unchanged.
    /// </summary>
    public Visibility? Visibility { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name is not null && (Name.Length == 0 || Name.All(char.IsWhiteSpace)))
            result += new Error("Adventure name cannot be empty.", nameof(Name));
        return result;
    }
}