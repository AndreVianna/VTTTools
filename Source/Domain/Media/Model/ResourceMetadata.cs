namespace VttTools.Media.Model;

public record ResourceMetadata {
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileLength { get; init; }
    public Size ImageSize { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }
}