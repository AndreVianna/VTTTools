namespace VttTools.AssetImageManager.Domain.Shared;

public static class ImageType {
    public const string TopDown = "TopDown";
    public const string Photo = "Photo";
    public const string Portrait = "Portrait";

    public static readonly string[] All = [TopDown, Photo, Portrait];

    public static readonly string[] ObjectImageTypes = [TopDown, Portrait];
    public static readonly string[] CreatureImageTypes = All;

    public static string[] For(string category)
        => category.ToLowerInvariant() switch {
            "object" => ObjectImageTypes,
            "creature" => CreatureImageTypes,
            _ => []
        };

    public static bool IsValid(string imageType) => imageType switch {
        TopDown or Photo or Portrait => true,
        _ => false
    };

    public static string ToFileName(string imageType) => imageType switch {
        TopDown => "top-down",
        Photo => "photo",
        Portrait => "portrait",
        _ => throw new ArgumentException($"Unknown image type: {imageType}", nameof(imageType))
    };
}
