namespace VttTools.Media.Model;

public record Resource
    : ResourceMetadata {
    public Stream Stream { get; init; } = null!;
}