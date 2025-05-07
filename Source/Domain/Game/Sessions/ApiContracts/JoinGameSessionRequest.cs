namespace VttTools.Game.Sessions.ApiContracts;

public record JoinGameSessionRequest
    : Request {
    public PlayerType JoinAs { get; init; }
}