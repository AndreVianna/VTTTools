namespace VttTools.Game.Sessions.ServiceContracts;

public record UpdateGameSessionData
    : Data {
    /// <summary>
    /// New title for the game session. If not set, title is unchanged.
    /// </summary>
    public Optional<string> Title { get; init; }
    /// <summary>
    /// New scene for the game session. If not set, scene is unchanged.
    /// </summary>
    public Optional<Guid> SceneId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Title.IsSet && string.IsNullOrWhiteSpace(Title.Value))
            result += new Error("Game session title cannot be null or empty.", nameof(Title));
        return result;
    }
}