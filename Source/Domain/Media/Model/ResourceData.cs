namespace VttTools.Media.Model;

public record ResourceData
    : ResourceFile {
    public Stream Stream { get; init; } = null!;
}