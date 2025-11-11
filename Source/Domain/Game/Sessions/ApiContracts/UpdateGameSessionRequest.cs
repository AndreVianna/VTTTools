namespace VttTools.Game.Sessions.ApiContracts;

public record UpdateGameSessionRequest
    : Request {
    /// <summary>
    /// New title for the game session. If not set, title is unchanged.
    /// </summary>
    public Optional<string> Title { get; init; }
    /// <summary>
    /// New encounter for the game session. If not set, encounter is unchanged.
    /// </summary>
    public Optional<Guid> EncounterId { get; init; }
}