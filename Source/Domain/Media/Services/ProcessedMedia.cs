using Size = VttTools.Common.Model.Size;

namespace VttTools.Media.Services;

public record ProcessedMedia {
    public required Stream Stream { get; init; }
    public required string ContentType { get; init; }
    public required string FileName { get; init; }
    public required long FileLength { get; init; }
    public Size Size { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; } = TimeSpan.Zero;
    public byte[]? Thumbnail { get; init; }
}