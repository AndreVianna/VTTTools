namespace VttTools.Media.Model;

public record Resource
    : ResourceFile {
    public Stream Stream { get; init; } = null!;
}