using Size = System.Drawing.Size;

namespace VttTools.Utilities;

public static class ResourceFileHandler {
    public static async Task<ResourceInfo?> GetResourceFileInfo(string id, Stream stream, ILogger? logger = null) {
        logger ??= NullLogger.Instance;
        try {
            var extension = Path.GetExtension(id).ToLowerInvariant();
            (var format, (var size, var duration)) = extension switch {
                ".png" or ".jpg" or ".jpeg" => (ResourceType.Image, await GetImageInfo(stream)),
                ".gif" => (ResourceType.Animation, await GetAnimationInfo(stream)),
                ".mp4" => (ResourceType.Video, await GetVideoInfo(stream)),
                _ => throw new NotSupportedException($"Unsupported file format: {extension}"),
            };
            return new() {
                Id = id,
                Type = format,
                Bytes = (ulong)(stream.Length < 0 ? 0 : stream.Length),
                Size = size,
                Duration = duration,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to load file '{FileName}'", id);
            return null;
        }
    }

    private static async Task<(Size, TimeSpan)> GetImageInfo(Stream stream) {
        using var image = await Image.LoadAsync(stream);
        return (new(image.Width, image.Height), TimeSpan.Zero);
    }

    private static async Task<(Size, TimeSpan)> GetAnimationInfo(Stream stream, int fps = 15) {
        using var image = await GifDecoder.Instance.DecodeAsync(new(), stream);
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