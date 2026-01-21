namespace VttTools.Audit.Model.Payloads;

public record ResourceGeneratedPayload {
    public string JobId { get; init; } = string.Empty;
    public int JobItemIndex { get; init; }
    public string ResourceType { get; init; } = string.Empty;
}