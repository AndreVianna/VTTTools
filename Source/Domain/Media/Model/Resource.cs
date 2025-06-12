namespace VttTools.Media.Model;

public record Resource {
    public Guid Id { get; init; }
    public string Path { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public ulong FileSize { get; init; }
    public Size ImageSize { get; init; }
    public TimeSpan Duration { get; init; }
}