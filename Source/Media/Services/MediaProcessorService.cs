using FFMpegCore;

using Size = VttTools.Common.Model.Size;

namespace VttTools.Media.Services;

public class MediaProcessorService(ILogger<MediaProcessorService> logger)
    : IMediaProcessorService {

    public async Task<Result<ProcessedMedia>> ProcessAsync(
        ResourceType resourceType,
        Stream input,
        string contentType,
        string fileName,
        CancellationToken ct = default) {
        if (!MediaConstraints.For.TryGetValue(resourceType, out var constraints))
            return Result.Failure<ProcessedMedia>(null!, $"Invalid resource type: '{resourceType}'. Please specify a valid resource type.");

        if (!MediaConstraints.IsValidContentType(resourceType, contentType)) {
            var allowedTypes = string.Join(", ", constraints.AllowedContentTypes);
            return Result.Failure<ProcessedMedia>(null!, $"Content type '{contentType}' is not allowed for resource type '{resourceType}'. Allowed types: {allowedTypes}");
        }

        if (input.Length > constraints.MaxFileSize) {
            var maxSizeMb = constraints.MaxFileSize / 1024.0 / 1024.0;
            var actualSizeMb = input.Length / 1024.0 / 1024.0;
            return Result.Failure<ProcessedMedia>(null!, $"File size ({actualSizeMb:F2} MB) exceeds maximum ({maxSizeMb:F2} MB) for resourceType '{resourceType}'");
        }

        var category = MediaConstraints.GetMediaCategory(contentType);
        return category switch {
            "image" => await ProcessImageAsync(input, fileName, constraints, ct),
            "audio" => await ProcessAudioAsync(input, fileName, constraints, ct),
            "video" => await ProcessVideoAsync(input, fileName, constraints, ct),
            _ => Result.Failure<ProcessedMedia>(null!, $"Unsupported media category: {category}"),
        };
    }

    public async Task<byte[]?> GenerateThumbnailAsync(
        Stream input,
        string contentType,
        int maxSize = 256,
        CancellationToken ct = default) {
        var category = MediaConstraints.GetMediaCategory(contentType);

        return category switch {
            "image" => await GenerateImageThumbnailAsync(input, maxSize, ct),
            "video" => await GenerateVideoThumbnailAsync(input, maxSize, ct),
            _ => null,
        };
    }

    private async Task<Result<ProcessedMedia>> ProcessImageAsync(
        Stream input,
        string fileName,
        TypeConstraints constraints,
        CancellationToken ct) {
        try {
            using var image = await Image.LoadAsync(input, ct);
            var originalSize = new Size(image.Width, image.Height);

            var needsResize = image.Width > constraints.MaxWidth || image.Height > constraints.MaxHeight;
            if (needsResize) {
                var scale = Math.Min(
                    (double)constraints.MaxWidth / image.Width,
                    (double)constraints.MaxHeight / image.Height);
                var newWidth = (int)(image.Width * scale);
                var newHeight = (int)(image.Height * scale);
                image.Mutate(x => x.Resize(newWidth, newHeight));
            }

            var outputStream = new MemoryStream();
            await image.SaveAsPngAsync(outputStream, new PngEncoder {
                CompressionLevel = PngCompressionLevel.BestCompression,
                TransparentColorMode = PngTransparentColorMode.Preserve
            }, ct);

            outputStream.Position = 0;
            var newFileName = Path.ChangeExtension(fileName, ".png");

            byte[]? thumbnail = null;
            if (constraints.GenerateThumbnail) {
                input.Position = 0;
                thumbnail = await GenerateImageThumbnailAsync(input, 256, ct);
            }

            return Result.Success(new ProcessedMedia {
                Stream = outputStream,
                ContentType = "image/png",
                FileName = newFileName,
                FileLength = (ulong)outputStream.Length,
                Size = new Size(image.Width, image.Height),
                Duration = TimeSpan.Zero,
                Thumbnail = thumbnail,
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to process image: {FileName}", fileName);
            return Result.Failure<ProcessedMedia>(null!, $"Failed to process image: {ex.Message}");
        }
    }

    private async Task<Result<ProcessedMedia>> ProcessAudioAsync(
        Stream input,
        string fileName,
        TypeConstraints constraints,
        CancellationToken ct) {
        try {
            var tempInputPath = Path.GetTempFileName();
            var tempOutputPath = Path.ChangeExtension(tempInputPath, ".ogg");

            try {
                await using (var fileStream = File.Create(tempInputPath)) {
                    await input.CopyToAsync(fileStream, ct);
                }

                var mediaInfo = await FFProbe.AnalyseAsync(tempInputPath, cancellationToken: ct);
                var duration = mediaInfo.Duration;

                if (constraints.MaxDuration > TimeSpan.Zero && duration > constraints.MaxDuration) {
                    return Result.Failure<ProcessedMedia>(null!, $"Audio duration ({duration.TotalSeconds:F1}s) exceeds maximum ({constraints.MaxDuration.TotalSeconds:F1}s)");
                }

                await FFMpegArguments
                    .FromFileInput(tempInputPath)
                    .OutputToFile(tempOutputPath, overwrite: true, options => options
                        .WithAudioCodec("libvorbis")
                        .WithAudioBitrate(128))
                    .ProcessAsynchronously();

                var outputStream = new MemoryStream();
                await using (var fileStream = File.OpenRead(tempOutputPath)) {
                    await fileStream.CopyToAsync(outputStream, ct);
                }
                outputStream.Position = 0;

                var newFileName = Path.ChangeExtension(fileName, ".ogg");

                return Result.Success(new ProcessedMedia {
                    Stream = outputStream,
                    ContentType = "audio/ogg",
                    FileName = newFileName,
                    FileLength = (ulong)outputStream.Length,
                    Size = Size.Zero,
                    Duration = duration,
                    Thumbnail = null,
                });
            }
            finally {
                if (File.Exists(tempInputPath))
                    File.Delete(tempInputPath);
                if (File.Exists(tempOutputPath))
                    File.Delete(tempOutputPath);
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to process audio: {FileName}", fileName);
            return Result.Failure<ProcessedMedia>(null!, $"Failed to process audio: {ex.Message}");
        }
    }

    private async Task<Result<ProcessedMedia>> ProcessVideoAsync(
        Stream input,
        string fileName,
        TypeConstraints constraints,
        CancellationToken ct) {
        try {
            var tempInputPath = Path.GetTempFileName();
            var tempOutputPath = Path.ChangeExtension(tempInputPath, ".mp4");

            try {
                await using (var fileStream = File.Create(tempInputPath)) {
                    await input.CopyToAsync(fileStream, ct);
                }

                var mediaInfo = await FFProbe.AnalyseAsync(tempInputPath, cancellationToken: ct);
                var duration = mediaInfo.Duration;
                var videoStream = mediaInfo.PrimaryVideoStream;

                if (videoStream is null)
                    return Result.Failure<ProcessedMedia>(null!, "Video file contains no video stream");

                if (constraints.MaxDuration > TimeSpan.Zero && duration > constraints.MaxDuration) {
                    return Result.Failure<ProcessedMedia>(null!, $"Video duration ({duration.TotalSeconds:F1}s) exceeds maximum ({constraints.MaxDuration.TotalSeconds:F1}s)");
                }

                var needsResize = videoStream.Width > constraints.MaxWidth || videoStream.Height > constraints.MaxHeight;
                var scale = needsResize
                    ? Math.Min(
                        (double)constraints.MaxWidth / videoStream.Width,
                        (double)constraints.MaxHeight / videoStream.Height)
                    : 1.0;
                var newWidth = (int)(videoStream.Width * scale);
                var newHeight = (int)(videoStream.Height * scale);
                if (newWidth % 2 != 0)
                    newWidth--;
                if (newHeight % 2 != 0)
                    newHeight--;

                var ffmpegArgs = FFMpegArguments
                    .FromFileInput(tempInputPath)
                    .OutputToFile(tempOutputPath, overwrite: true, options => {
                        options.WithVideoCodec("libx264")
                               .WithAudioCodec("aac")
                               .WithFastStart();

                        if (needsResize)
                            options.WithVideoFilters(filter => filter.Scale(newWidth, newHeight));
                    });

                await ffmpegArgs.ProcessAsynchronously();

                var outputStream = new MemoryStream();
                await using (var fileStream = File.OpenRead(tempOutputPath)) {
                    await fileStream.CopyToAsync(outputStream, ct);
                }
                outputStream.Position = 0;

                byte[]? thumbnail = null;
                if (constraints.GenerateThumbnail) {
                    thumbnail = await GenerateVideoThumbnailFromFileAsync(tempInputPath, 256, ct);
                }

                var newFileName = Path.ChangeExtension(fileName, ".mp4");

                return Result.Success(new ProcessedMedia {
                    Stream = outputStream,
                    ContentType = "video/mp4",
                    FileName = newFileName,
                    FileLength = (ulong)outputStream.Length,
                    Size = new Size(newWidth, newHeight),
                    Duration = duration,
                    Thumbnail = thumbnail,
                });
            }
            finally {
                if (File.Exists(tempInputPath))
                    File.Delete(tempInputPath);
                if (File.Exists(tempOutputPath))
                    File.Delete(tempOutputPath);
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to process video: {FileName}", fileName);
            return Result.Failure<ProcessedMedia>(null!, $"Failed to process video: {ex.Message}");
        }
    }

    private async Task<byte[]?> GenerateImageThumbnailAsync(Stream input, int maxSize, CancellationToken ct) {
        try {
            input.Position = 0;
            using var image = await Image.LoadAsync(input, ct);

            var scale = Math.Min((double)maxSize / image.Width, (double)maxSize / image.Height);
            if (scale < 1.0) {
                var newWidth = (int)(image.Width * scale);
                var newHeight = (int)(image.Height * scale);
                image.Mutate(x => x.Resize(newWidth, newHeight));
            }

            await using var outputStream = new MemoryStream();
            await image.SaveAsJpegAsync(outputStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder {
                Quality = 75
            }, ct);

            return outputStream.ToArray();
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Failed to generate image thumbnail");
            return null;
        }
    }

    private async Task<byte[]?> GenerateVideoThumbnailAsync(Stream input, int maxSize, CancellationToken ct) {
        var tempInputPath = Path.GetTempFileName();
        try {
            await using (var fileStream = File.Create(tempInputPath)) {
                await input.CopyToAsync(fileStream, ct);
            }
            return await GenerateVideoThumbnailFromFileAsync(tempInputPath, maxSize, ct);
        }
        finally {
            if (File.Exists(tempInputPath))
                File.Delete(tempInputPath);
        }
    }

    private async Task<byte[]?> GenerateVideoThumbnailFromFileAsync(string videoPath, int maxSize, CancellationToken ct) {
        var tempThumbnailPath = Path.GetTempFileName() + ".jpg";
        try {
            await FFMpegArguments
                .FromFileInput(videoPath, verifyExists: false, options => options.Seek(TimeSpan.FromSeconds(1)))
                .OutputToFile(tempThumbnailPath, overwrite: true, options => options
                    .WithVideoFilters(filter => filter.Scale(maxSize, -1))
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
}