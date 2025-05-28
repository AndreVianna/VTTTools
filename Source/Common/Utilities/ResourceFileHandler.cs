using VttTools.Media.Model;

namespace VttTools.Utilities;

public static class ResourceFileHandler {
    public static async Task<ResourceFileInfo?> GetResourceFileInfo(string fileName, Stream stream, ILogger? logger = null) {
        logger ??= NullLogger.Instance;
        var nameOnly = Path.GetFileNameWithoutExtension(fileName).ToLowerInvariant();
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch {
            ".png" => await GetImageInfo(nameOnly, stream, logger),
            ".gif" => await GetAnimationInfo(nameOnly, stream, logger),
            ".mp4" => await GetVideoInfo(nameOnly, stream, logger),
            _ => null,
        };
    }

    private static async Task<ResourceFileInfo?> GetImageInfo(string nameOnly, Stream stream, ILogger logger) {
        try {
            using var image = await Image.LoadAsync(stream);
            return new(ResourceType.Image, nameOnly, image.Width, image.Height);
        }
        catch {
            logger.LogError("Failed to load image from '{NameOnly}.png'", nameOnly);
            return null;
        }
    }

    private static async Task<ResourceFileInfo?> GetAnimationInfo(string nameOnly, Stream stream, ILogger logger) {
        try {
            using var image = await Image.LoadAsync(stream);
            return new(ResourceType.Animation, nameOnly, image.Width, image.Height);
        }
        catch {
            logger.LogError("Failed to load animation from '{NameOnly}.gif'", nameOnly);
            return null;
        }
    }

    private static async Task<ResourceFileInfo?> GetVideoInfo(string nameOnly, Stream stream, ILogger logger) {
        var tempFilePath = Path.GetTempFileName();
        try {
            await using var fileStream = File.Create(tempFilePath);
            if (stream.CanSeek) stream.Position = 0;
            await stream.CopyToAsync(fileStream);
            var mediaInfo = await FFMpegCore.FFProbe.AnalyseAsync(tempFilePath);
            var video = mediaInfo.VideoStreams.FirstOrDefault();
            return new(ResourceType.Video, nameOnly, video?.Width ?? 0, video?.Height ?? 0);
        }
        catch {
            logger.LogError("Failed to analyze video from '{NameOnly}.mp4'", nameOnly);
            return null;
        }
        finally {
            File.Delete(tempFilePath);
        }
    }
}
