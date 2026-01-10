
using Size = VttTools.Common.Model.Size;

namespace VttTools.Media.Services;

public class MediaProcessorService(ILogger<MediaProcessorService> logger)
    : IMediaProcessorService {


    public async Task<byte[]?> GenerateThumbnailAsync(string contentType, Stream stream, int maxSize = 256, CancellationToken ct = default) {
        var category = MediaConstraints.GetMediaCategory(contentType);

        return category switch {
            "image" => await GenerateImageThumbnailAsync(stream, maxSize, ct),
            "video" => await GenerateVideoThumbnailAsync(stream, maxSize, ct),
            _ => null,
        };
    }

    public async Task<byte[]> ExtractPlaceholderAsync(string contentType, Stream stream, CancellationToken ct = default) {
        var category = MediaConstraints.GetMediaCategory(contentType);
        if (category != "video")
            return [];

        var tempInputPath = Path.GetTempFileName();
        var tempOutputPath = Path.ChangeExtension(tempInputPath, ".png");
        try {
            await using (var fileStream = File.Create(tempInputPath)) {
                await stream.CopyToAsync(fileStream, ct);
            }

            // Extract first frame at original dimensions
            await FFMpegArguments
                .FromFileInput(tempInputPath, verifyExists: false, options => options.Seek(TimeSpan.Zero))
                .OutputToFile(tempOutputPath, overwrite: true, options => options
                    .WithFrameOutputCount(1))
                .ProcessAsynchronously();

            return File.Exists(tempOutputPath)
                ? await File.ReadAllBytesAsync(tempOutputPath, ct)
                : [];
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to extract placeholder from video");
            return [];
        }
        finally {
            if (File.Exists(tempInputPath))
                File.Delete(tempInputPath);
            if (File.Exists(tempOutputPath))
                File.Delete(tempOutputPath);
        }
    }

    public async Task<Stream> ConvertVideoAsync(Stream stream, CancellationToken ct = default) {
        var tempInputPath = Path.GetTempFileName();
        var tempOutputPath = Path.ChangeExtension(tempInputPath, ".mp4");
        try {
            await using (var fileStream = File.Create(tempInputPath)) {
                await stream.CopyToAsync(fileStream, ct);
            }

            await FFMpegArguments
                .FromFileInput(tempInputPath)
                .OutputToFile(tempOutputPath, overwrite: true, options => options.WithVideoCodec("libx264")
                           .WithAudioCodec("aac")
                           .WithFastStart())
                .ProcessAsynchronously();

            var outputStream = new MemoryStream();
            await using (var fileStream = File.OpenRead(tempOutputPath)) {
                await fileStream.CopyToAsync(outputStream, ct);
            }
            outputStream.Position = 0;
            return outputStream;
        }
        finally {
            if (File.Exists(tempInputPath))
                File.Delete(tempInputPath);
            if (File.Exists(tempOutputPath))
                File.Delete(tempOutputPath);
        }
    }


    private async Task<byte[]?> GenerateImageThumbnailAsync(Stream input, int thumbnailSize, CancellationToken ct) {
        try {
            input.Position = 0;
            return await GenerateCenterCropThumbnailAsync(input, thumbnailSize, ct);
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to generate image thumbnail");
            return null;
        }
    }

    private static async Task<byte[]> GenerateCenterCropThumbnailAsync(Stream input, int thumbnailSize, CancellationToken ct = default) {
        using var image = await Image.LoadAsync(input, ct);

        var cropSize = Math.Min(image.Width, image.Height);
        var x = (image.Width - cropSize) / 2;
        var y = (image.Height - cropSize) / 2;

        image.Mutate(ctx => ctx
            .Crop(new Rectangle(x, y, cropSize, cropSize))
            .Resize(thumbnailSize, thumbnailSize));

        await using var outputStream = new MemoryStream();
        await image.SaveAsPngAsync(outputStream, new() {
            CompressionLevel = PngCompressionLevel.BestCompression,
            TransparentColorMode = PngTransparentColorMode.Preserve
        }, ct);

        return outputStream.ToArray();
    }

    private async Task<byte[]?> GenerateVideoThumbnailAsync(Stream input, int thumbnailSize, CancellationToken ct) {
        var tempInputPath = Path.GetTempFileName();
        try {
            await using (var fileStream = File.Create(tempInputPath)) {
                await input.CopyToAsync(fileStream, ct);
            }
            return await GenerateVideoThumbnailFromFileAsync(tempInputPath, thumbnailSize, ct);
        }
        finally {
            if (File.Exists(tempInputPath))
                File.Delete(tempInputPath);
        }
    }

    private async Task<byte[]?> GenerateVideoThumbnailFromFileAsync(string videoPath, int thumbnailSize, CancellationToken ct) {
        var tempThumbnailPath = Path.GetTempFileName() + ".jpg";
        try {
            await FFMpegArguments
                .FromFileInput(videoPath, verifyExists: false, options => options.Seek(TimeSpan.FromSeconds(1)))
                .OutputToFile(tempThumbnailPath, overwrite: true, options => options
                    .WithVideoFilters(filter => filter.Scale(thumbnailSize, -1))
                    .WithFrameOutputCount(1))
                .ProcessAsynchronously();

            return File.Exists(tempThumbnailPath)
                ? await File.ReadAllBytesAsync(tempThumbnailPath, ct)
                : null;
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to generate video thumbnail");
            return null;
        }
        finally {
            if (File.Exists(tempThumbnailPath))
                File.Delete(tempThumbnailPath);
        }
    }

    public async Task<(Size Dimensions, TimeSpan Duration)> ExtractMediaInfoAsync(string contentType, Stream stream, CancellationToken ct = default) {
        var category = MediaConstraints.GetMediaCategory(contentType);

        return category switch {
            "image" => await ExtractImageInfoAsync(stream, ct),
            "video" => await ExtractVideoInfoAsync(stream, ct),
            "audio" => await ExtractAudioInfoAsync(stream, ct),
            _ => (Size.Zero, TimeSpan.Zero),
        };
    }

    private async Task<(Size Dimensions, TimeSpan Duration)> ExtractImageInfoAsync(Stream stream, CancellationToken ct) {
        try {
            stream.Position = 0;
            using var image = await Image.LoadAsync(stream, ct);
            return (new Size(image.Width, image.Height), TimeSpan.Zero);
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to extract image info");
            return (Size.Zero, TimeSpan.Zero);
        }
    }

    private async Task<(Size Dimensions, TimeSpan Duration)> ExtractVideoInfoAsync(Stream stream, CancellationToken ct) {
        var tempPath = Path.GetTempFileName();
        try {
            await using (var fileStream = File.Create(tempPath)) {
                stream.Position = 0;
                await stream.CopyToAsync(fileStream, ct);
            }

            var mediaInfo = await FFProbe.AnalyseAsync(tempPath, cancellationToken: ct);
            var videoStream = mediaInfo.PrimaryVideoStream;

            return videoStream is not null
                ? (new Size(videoStream.Width, videoStream.Height), mediaInfo.Duration)
                : (Size.Zero, mediaInfo.Duration);
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to extract video info");
            return (Size.Zero, TimeSpan.Zero);
        }
        finally {
            if (File.Exists(tempPath))
                File.Delete(tempPath);
        }
    }

    private async Task<(Size Dimensions, TimeSpan Duration)> ExtractAudioInfoAsync(Stream stream, CancellationToken ct) {
        var tempPath = Path.GetTempFileName();
        try {
            await using (var fileStream = File.Create(tempPath)) {
                stream.Position = 0;
                await stream.CopyToAsync(fileStream, ct);
            }

            var mediaInfo = await FFProbe.AnalyseAsync(tempPath, cancellationToken: ct);
            return (Size.Zero, mediaInfo.Duration);
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to extract audio info");
            return (Size.Zero, TimeSpan.Zero);
        }
        finally {
            if (File.Exists(tempPath))
                File.Delete(tempPath);
        }
    }

    public async Task<Stream> ConvertImageAsync(Stream stream, CancellationToken ct = default) {
        stream.Position = 0;
        using var image = await Image.LoadAsync(stream, ct);

        var outputStream = new MemoryStream();
        await image.SaveAsPngAsync(outputStream, new() {
            CompressionLevel = PngCompressionLevel.BestCompression,
            TransparentColorMode = PngTransparentColorMode.Preserve
        }, ct);

        outputStream.Position = 0;
        return outputStream;
    }
}