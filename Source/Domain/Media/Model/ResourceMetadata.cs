namespace VttTools.Media.Model;

public record ResourceMetadata {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    public string ContentType { get; init; } = string.Empty;
    public string Path { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileSize { get; init; }
    public Size Dimensions { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }
}