namespace VttTools.Audit.Model.Payloads;

public record JobCreatedPayload {
    public string Type { get; init; } = string.Empty;
    public int TotalItems { get; init; }
    public string? EstimatedDuration { get; init; }
}