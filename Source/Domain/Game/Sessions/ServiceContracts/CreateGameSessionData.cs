namespace VttTools.Game.Sessions.ServiceContracts;

public record CreateGameSessionData
    : Data {
    /// <summary>
    /// The title of the new game session.
    /// </summary>
    public string Title { get; init; } = string.Empty;
    /// <summary>
    /// The initial Scene to activate when the game session starts.
    /// </summary>
    public Guid SceneId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Title))
            result += new Error("Game session title cannot be null or empty.", nameof(Title));
        return result;
    }
}