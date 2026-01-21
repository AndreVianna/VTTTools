namespace VttTools.Audit.Model.Payloads;

public record AssetGeneratedPayload {
    public string JobId { get; init; } = string.Empty;
    public int JobItemIndex { get; init; }
    public string? PortraitResourceId { get; init; }
    public string? TokenResourceId { get; init; }
}