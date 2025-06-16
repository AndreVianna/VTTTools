using FileData = (System.Drawing.Size Size, System.TimeSpan Duration);
using Size = System.Drawing.Size;

namespace VttTools.Utilities;

public static class FormFileExtensions {
    public static async Task<Result<AddResourceData>> ToData(this IFormFile file, string path, Stream stream, params string[] tags) {
        var result = await GetFileData(file.FileName, stream);
        if (stream.CanSeek)
            stream.Position = 0;
        return result.HasErrors switch {
            true => Result.Failure(result.Errors),
            _ => new AddResourceData {
                Path = path,
                Metadata = new ResourceMetadata {
                    ContentType = file.ContentType,
                    FileName = file.FileName,
                    FileLength = (ulong)file.Length,
                    ImageSize = result.Value.Size,
                    Duration = result.Value.Duration,
                },
                Tags = tags,
            },
        };
    }

    private static async Task<Result<FileData>> GetFileData(string fileName, Stream stream) {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch {
            ".jpg" or ".jpeg" or ".png" => await GetImageInfo(stream),
            ".gif" => await GetGifInfo(stream),
            ".webp" => await GetWebpInfo(stream),
            ".mp4" => await GetVideoInfo(stream),
            _ => Result.Failure($"Unsupported file format: {extension}. Supported files: jpg, jpeg, png, gif, webp, and mp4."),
        };
    }

    private static async Task<(Size, TimeSpan)> GetImageInfo(Stream stream) {
        using var image = await SixLabors.ImageSharp.Image.LoadAsync(stream);
        return (new(image.Width, image.Height), TimeSpan.Zero);
    }

    private static async Task<(Size, TimeSpan)> GetGifInfo(Stream stream, int fps = 15) {
        using var image = await GifDecoder.Instance.DecodeAsync(new(), stream);
        var totalDelay = image.Frames.Aggregate(0.0, (d, f) => d + f.Metadata.GetGifMetadata().FrameDelay);
        var duration = ((double)image.Frames.Count / fps) + (totalDelay / 100.0);
        return (new(image.Width, image.Height), TimeSpan.FromSeconds(duration));
    }

    private static async Task<(Size, TimeSpan)> GetWebpInfo(Stream stream, int fps = 15) {
        using var image = await WebpDecoder.Instance.DecodeAsync(new(), stream);
        var totalDelay = image.Frames.Aggregate(0.0, (d, f) => d + f.Metadata.GetGifMetadata().FrameDelay);
        var duration = ((double)image.Frames.Count / fps) + (totalDelay / 100.0);
        return (new(image.Width, image.Height), TimeSpan.FromSeconds(duration));
    }

    private static async Task<(Size, TimeSpan)> GetVideoInfo(Stream stream) {
        var tempFilePath = Path.GetTempFileName();
        try {
            await using var fileStream = File.Create(tempFilePath);
            if (stream.CanSeek)
                stream.Position = 0;
            await stream.CopyToAsync(fileStream);
            var mediaInfo = await FFMpegCore.FFProbe.AnalyseAsync(tempFilePath);
            var video = mediaInfo.VideoStreams[0];
            return new(new(video.Width, video.Height), video.Duration);
        }
        finally {
            File.Delete(tempFilePath);
        }
    }
}