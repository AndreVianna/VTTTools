namespace VttTools.Media.Options;

public static class MediaConstraints {
    private static readonly string[] _safeImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    private static readonly string[] _safeAudioTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
    ];

    private static readonly string[] _safeVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
    ];

    public static readonly Dictionary<ResourceType, TypeConstraints> For = new() {
        [ResourceType.Background] = new() {
            AllowedContentTypes = [.. _safeImageTypes, .. _safeVideoTypes],
            MaxWidth = 4096,
            MaxHeight = 4096,
            MaxDuration = TimeSpan.FromMinutes(5),
            MaxFileSize = 50 * 1024 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = true,
            StorageFolder = "backgrounds",
        },
        [ResourceType.Token] = new() {
            AllowedContentTypes = [.. _safeImageTypes],
            MaxWidth = 256,
            MaxHeight = 256,
            MaxDuration = TimeSpan.Zero,
            MaxFileSize = 500 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = true,
            StorageFolder = "tokens",
        },
        [ResourceType.Portrait] = new() {
            AllowedContentTypes = [.. _safeImageTypes, .. _safeVideoTypes],
            MaxWidth = 512,
            MaxHeight = 512,
            MaxDuration = TimeSpan.FromSeconds(5),
            MaxFileSize = 2 * 1024 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = true,
            StorageFolder = "portraits",
        },
        [ResourceType.Overlay] = new() {
            AllowedContentTypes = [.. _safeImageTypes, .. _safeVideoTypes],
            MaxWidth = 4096,
            MaxHeight = 4096,
            MaxDuration = TimeSpan.FromSeconds(30),
            MaxFileSize = 20 * 1024 * 1024,
            RequiresTransparency = true,
            GenerateThumbnail = true,
            StorageFolder = "overlays",
        },
        [ResourceType.Illustration] = new() {
            AllowedContentTypes = [.. _safeImageTypes],
            MaxWidth = 1024,
            MaxHeight = 1024,
            MaxDuration = TimeSpan.Zero,
            MaxFileSize = 5 * 1024 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = true,
            StorageFolder = "illustrations",
        },
        [ResourceType.SoundEffect] = new() {
            AllowedContentTypes = [.. _safeAudioTypes],
            MaxWidth = 0,
            MaxHeight = 0,
            MaxDuration = TimeSpan.FromSeconds(10),
            MaxFileSize = 1 * 1024 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = false,
            StorageFolder = "sound-effects",
        },
        [ResourceType.AmbientSound] = new() {
            AllowedContentTypes = [.. _safeAudioTypes],
            MaxWidth = 0,
            MaxHeight = 0,
            MaxDuration = TimeSpan.FromMinutes(10),
            MaxFileSize = 15 * 1024 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = false,
            StorageFolder = "ambient-sounds",
        },
        [ResourceType.CutScene] = new() {
            AllowedContentTypes = [.. _safeVideoTypes],
            MaxWidth = 1920,
            MaxHeight = 1080,
            MaxDuration = TimeSpan.FromMinutes(2),
            MaxFileSize = 100 * 1024 * 1024,
            RequiresTransparency = false,
            GenerateThumbnail = true,
            StorageFolder = "cutscenes",
        },
    };

    public static bool IsValidContentType(ResourceType type, string contentType)
        => For[type].AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase);

    public static string GetMediaCategory(string contentType) {
        var normalizedType = contentType.ToLowerInvariant();
        return _safeImageTypes.Contains(normalizedType, StringComparer.OrdinalIgnoreCase) ? "image"
            : _safeAudioTypes.Contains(normalizedType, StringComparer.OrdinalIgnoreCase) ? "audio"
            : _safeVideoTypes.Contains(normalizedType, StringComparer.OrdinalIgnoreCase) ? "video"
            : "unknown";
    }
}