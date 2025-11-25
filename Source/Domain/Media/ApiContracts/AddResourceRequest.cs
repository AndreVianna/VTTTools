namespace VttTools.Media.ApiContracts;

public record AddResourceRequest {
    public string? Description { get; init; }
    public string[] Tags { get; init; } = [];

    public string Path { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileLength { get; init; }
    public Size ImageSize { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }

    public Stream Stream { get; init; } = null!;
}