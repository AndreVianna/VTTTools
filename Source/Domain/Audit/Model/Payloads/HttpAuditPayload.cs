namespace VttTools.Audit.Model.Payloads;

public record HttpAuditPayload {
    public string HttpMethod { get; init; } = string.Empty;
    public string Path { get; init; } = string.Empty;
    public string? QueryString { get; init; }
    public int StatusCode { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public string? RequestBody { get; init; }
    public string? ResponseBody { get; init; }
    public int DurationMs { get; init; }
    public string Result { get; init; } = string.Empty;
}
