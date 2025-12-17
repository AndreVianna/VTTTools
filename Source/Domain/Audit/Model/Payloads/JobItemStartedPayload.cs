namespace VttTools.Audit.Model.Payloads;

public record JobItemStartedPayload {
    public int Index { get; init; }
    public DateTime StartedAt { get; init; }
}
