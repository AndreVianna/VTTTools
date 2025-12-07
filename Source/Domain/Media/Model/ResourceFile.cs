namespace VttTools.Media.Model;

public record ResourceFile {
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileLength { get; init; }
    public Size Size { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }
}