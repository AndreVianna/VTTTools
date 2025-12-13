namespace VttTools.Media.Options;

public record TypeConstraints {
    public required string[] AllowedContentTypes { get; init; }
    public int MaxWidth { get; init; }
    public int MaxHeight { get; init; }
    public TimeSpan MaxDuration { get; init; }
    public long MaxFileSize { get; init; }
    public bool RequiresTransparency { get; init; }
    public bool GenerateThumbnail { get; init; }
    public required string StorageFolder { get; init; }
}