namespace VttTools.Audit.Model.Payloads;

public record JobCompletedPayload {
    public DateTime CompletedAt { get; init; }
    public int SuccessCount { get; init; }
    public int FailedCount { get; init; }
}
