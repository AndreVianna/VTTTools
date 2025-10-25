namespace VttTools.Media.Options;

public class ResourceUploadOptions {
    public const string SectionName = "ResourceUpload";

    public Dictionary<string, long> MaxSizeLimits { get; init; } = new() {
        { "image", 5 * 1024 * 1024 },
        { "background", 10 * 1024 * 1024 },
        { "token", 2 * 1024 * 1024 },
        { "display", 5 * 1024 * 1024 }
    };

    public long GetMaxSize(string resourceType)
        => MaxSizeLimits.TryGetValue(resourceType, out var size)
            ? size
            : 5 * 1024 * 1024;
}