namespace VttTools.Media.Model;

public record ResourceFile
    : ResourceMetadata {
    public Stream Stream { get; init; } = null!;
}