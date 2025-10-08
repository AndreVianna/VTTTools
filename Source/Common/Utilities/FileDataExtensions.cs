using FileData = (VttTools.Common.Model.Size Size, System.TimeSpan Duration);
using Size = VttTools.Common.Model.Size;

namespace VttTools.Utilities;

public static class FileDataExtensions {
    public static async Task<Result<AddResourceData>> ToData(this IFileData file, string path, Stream stream, params string[] tags) {
        var result = await GetFileData(file.FileName, stream);
        if (stream.CanSeek)
            stream.Position = 0;
        return result.HasErrors switch {
            true => Result.Failure(result.Errors),
            _ => new AddResourceData {
                Path = path,
                Metadata = new ResourceMetadata {
                    ContentType = GetContentType(file.FileName, file.ContentType),
                    FileName = file.FileName,
                    FileLength = (ulong)file.Length,
                    ImageSize = new Size(result.Value.Size.Width, result.Value.Size.Height),
                    Duration = result.Value.Duration,
                },
                Tags = tags,
            },
        };
    }

    private static string GetContentType(string fileName, string uploadedContentType) {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch {
            ".svg" => "image/svg+xml",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            _ => uploadedContentType  // Fall back to uploaded content type
        };
    }

    private static async Task<Result<FileData>> GetFileData(string fileName, Stream stream) {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch {
            ".jpg" or ".jpeg" or ".png" => await GetImageInfo(stream),
            ".gif" => await GetGifInfo(stream),
            ".webp" => await GetWebpInfo(stream),
            ".mp4" => await GetVideoInfo(stream),
            ".svg" => await GetSvgInfo(stream),  // SVG is scalable - return default size
            _ => Result.Failure($"Unsupported file format: {extension}. Supported files: jpg, jpeg, png, gif, webp, svg, and mp4."),
        };
    }

    private static async Task<FileData> GetImageInfo(Stream stream) {
        using var image = await Image.LoadAsync(stream);
        return (new Size(image.Width, image.Height), TimeSpan.Zero);
    }

    private static async Task<FileData> GetGifInfo(Stream stream, int fps = 15) {
        using var image = await GifDecoder.Instance.DecodeAsync(new(), stream);
        var totalDelay = image.Frames.Aggregate(0.0, (d, f) => d + f.Metadata.GetGifMetadata().FrameDelay);
        var duration = ((double)image.Frames.Count / fps) + (totalDelay / 100.0);
        return (new Size(image.Width, image.Height), TimeSpan.FromSeconds(duration));
    }

    private static async Task<FileData> GetWebpInfo(Stream stream, int fps = 15) {
        using var image = await WebpDecoder.Instance.DecodeAsync(new(), stream);
        var totalDelay = image.Frames.Aggregate(0.0, (d, f) => d + f.Metadata.GetGifMetadata().FrameDelay);
        var duration = ((double)image.Frames.Count / fps) + (totalDelay / 100.0);
        return (new Size(image.Width, image.Height), TimeSpan.FromSeconds(duration));
    }

    private static async Task<FileData> GetVideoInfo(Stream stream) {
        var tempFilePath = Path.GetTempFileName();
        try {
            await using var fileStream = File.Create(tempFilePath);
            if (stream.CanSeek)
                stream.Position = 0;
            await stream.CopyToAsync(fileStream);
            var mediaInfo = await FFMpegCore.FFProbe.AnalyseAsync(tempFilePath);
            var video = mediaInfo.VideoStreams[0];
            return new(new Size(video.Width, video.Height), video.Duration);
        }
        finally {
            File.Delete(tempFilePath);
        }
    }

    private static async Task<FileData> GetSvgInfo(Stream stream) {
        // Parse SVG XML to extract width/height from the root <svg> element
        using var reader = new StreamReader(stream, leaveOpen: true);
        var svgContent = await reader.ReadToEndAsync();

        var doc = System.Xml.Linq.XDocument.Parse(svgContent);
        var svgElement = doc.Root;

        // Try to get width and height attributes
        var widthAttr = svgElement?.Attribute("width")?.Value;
        var heightAttr = svgElement?.Attribute("height")?.Value;

        // If width/height not found, try viewBox
        if (string.IsNullOrEmpty(widthAttr) || string.IsNullOrEmpty(heightAttr)) {
            var viewBoxAttr = svgElement?.Attribute("viewBox")?.Value;
            if (!string.IsNullOrEmpty(viewBoxAttr)) {
                var parts = viewBoxAttr.Split(' ');
                if (parts.Length == 4) {
                    // viewBox format: "minX minY width height"
                    widthAttr = parts[2];
                    heightAttr = parts[3];
                }
            }
        }

        // Parse dimensions, removing any 'px' suffix
        var width = TryParseSize(widthAttr) ?? 512;
        var height = TryParseSize(heightAttr) ?? 512;

        return (new Size(width, height), TimeSpan.Zero);
    }

    private static int? TryParseSize(string? value) {
        if (string.IsNullOrEmpty(value))
            return null;

        // Remove common unit suffixes
        value = value.Replace("px", "").Replace("pt", "").Trim();

        return int.TryParse(value, out var result) ? result : null;
    }
}