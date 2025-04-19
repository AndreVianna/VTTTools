namespace VttTools.Contracts.Game;

public record JoinMeetingRequest
    : Request {
    public PlayerType JoinAs { get; init; }
}