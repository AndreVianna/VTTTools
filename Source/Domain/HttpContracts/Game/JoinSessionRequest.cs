namespace VttTools.HttpContracts.Game;

public record JoinSessionRequest
    : Request {
    public PlayerType JoinAs { get; init; }
}
