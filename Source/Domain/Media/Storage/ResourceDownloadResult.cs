namespace VttTools.Media.Storage;

public record ResourceDownloadResult {
    public required Stream Content { get; init; }
    public string ContentType { get; init; } = string.Empty;
    public Dictionary<string, string> Metadata { get; init; } = [];
}