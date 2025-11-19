namespace VttTools.AssetImageManager.Domain.Shared;

public static class ImageType {
    public const string TopDown = "TopDown";
    public const string Miniature = "Miniature";
    public const string Photo = "Photo";
    public const string Portrait = "Portrait";

    public static readonly string[] All = [TopDown, Miniature, Photo, Portrait];

    public static bool IsValid(string imageType) => imageType switch {
        TopDown or Miniature or Photo or Portrait => true,
        _ => false
    };

    public static string ToFileName(string imageType) => imageType switch {
        TopDown => "top-down",
        Miniature => "miniature",
        Photo => "photo",
        Portrait => "portrait",
        _ => throw new ArgumentException($"Unknown image type: {imageType}", nameof(imageType))
    };
}
