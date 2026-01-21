namespace VttTools.Audit.Model.Payloads;

public record JobItemCompletedPayload {
    public int Index { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? Result { get; init; }
    public string? CreatedAssetId { get; init; }
    public string[]? CreatedResourceIds { get; init; }
}