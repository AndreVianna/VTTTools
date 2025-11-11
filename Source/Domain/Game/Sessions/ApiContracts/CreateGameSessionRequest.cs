namespace VttTools.Game.Sessions.ApiContracts;

public record CreateGameSessionRequest
    : Request {
    /// <summary>
    /// The title of the new game session.
    /// </summary>
    public string Title { get; init; } = string.Empty;
    /// <summary>
    /// The initial Encounter to activate when the game session starts.
    /// </summary>
    [Required]
    public Guid EncounterId { get; init; }
}