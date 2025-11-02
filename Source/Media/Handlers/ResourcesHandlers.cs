using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

internal static class ResourcesHandlers {
    internal static async Task<IResult> UploadFileHandler(HttpContext context,
                                                          [FromForm] string type,
                                                          [FromForm] string resource,
                                                          [FromForm] IFormFile file,
                                                          [FromForm] string? entityId,
                                                          [FromServices] IResourceService storage,
                                                          [FromServices] IOptions<ResourceUploadOptions> uploadOptions) {
        // Generate GUID v7 for consistent timestamp-based IDs
        var guidId = Guid.CreateVersion7();

        // Get user ID from context
        var userId = context.User.GetUserId();

        var request = new UploadRequest {
            Id = guidId,
            Type = type,
            Resource = resource,
            File = file.ToFileData()
        };
        try {
            await using var originalStream = request.File.OpenReadStream();
            Stream streamToUse;
            MemoryStream? pngStream = null;
            var fileName = request.File.FileName;
            var contentType = request.File.ContentType;

            // Validate that file is an image
            var isImage = contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);

            if (!isImage) {
                return Results.Problem(
                    detail: $"Invalid file format: '{contentType}'. Only image files are allowed.",
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid file format.");
            }

            if (contentType == "image/svg+xml") {
                // SVG → PNG conversion using Svg.Skia
                using var svg = new SKSvg();
                var picture = svg.Load(originalStream);

                if (picture == null) {
                    return Results.Problem(
                        detail: "Failed to load SVG file. The file may be corrupted or invalid.",
                        statusCode: StatusCodes.Status400BadRequest,
                        title: "Invalid SVG file.");
                }

                // Use SVG dimensions or default to 512x512
                var width = (int)(picture.CullRect.Width > 0 ? picture.CullRect.Width : 512);
                var height = (int)(picture.CullRect.Height > 0 ? picture.CullRect.Height : 512);

                // Max dimensions 2048x2048 to prevent huge files
                if (width > 2048 || height > 2048) {
                    var scale = Math.Min(2048.0 / width, 2048.0 / height);
                    width = (int)(width * scale);
                    height = (int)(height * scale);
                }

                using var bitmap = new SKBitmap(width, height);
                using var canvas = new SKCanvas(bitmap);
                canvas.Clear(SKColors.Transparent);
                canvas.DrawPicture(picture);

                using var skImage = SKImage.FromBitmap(bitmap);
                using var pngData = skImage.Encode(SKEncodedImageFormat.Png, 100);

                pngStream = new MemoryStream();
                pngData.SaveTo(pngStream);

                var maxSize = uploadOptions.Value.GetMaxSize(resource);
                if (pngStream.Length > maxSize) {
                    await pngStream.DisposeAsync();
                    return Results.Problem(
                        detail: $"Converted PNG image exceeds {maxSize / 1024.0 / 1024.0:F0}MB limit. Size: {pngStream.Length / 1024.0 / 1024.0:F2}MB",
                        statusCode: StatusCodes.Status413RequestEntityTooLarge,
                        title: "Image too large after conversion.");
                }

                pngStream.Position = 0;
                streamToUse = pngStream;

                // Update file metadata to reflect PNG format
                fileName = Path.ChangeExtension(fileName, ".png");
                contentType = "image/png";
            }
            else if (isImage && contentType != "image/png") {
                // Existing ImageSharp raster conversion
                using var image = await Image.LoadAsync(originalStream);
                pngStream = new MemoryStream();
                await image.SaveAsPngAsync(pngStream, new PngEncoder {
                    CompressionLevel = PngCompressionLevel.BestCompression,
                    TransparentColorMode = PngTransparentColorMode.Preserve
                });

                var maxSize = uploadOptions.Value.GetMaxSize(resource);
                if (pngStream.Length > maxSize) {
                    await pngStream.DisposeAsync();
                    return Results.Problem(
                        detail: $"Converted PNG image exceeds {maxSize / 1024.0 / 1024.0:F0}MB limit. Size: {pngStream.Length / 1024.0 / 1024.0:F2}MB",
                        statusCode: StatusCodes.Status413RequestEntityTooLarge,
                        title: "Image too large after conversion.");
                }

                pngStream.Position = 0;
                streamToUse = pngStream;

                // Update file metadata to reflect PNG format
                fileName = Path.ChangeExtension(fileName, ".png");
                contentType = "image/png";
            }
            else {
                // PNG or non-image - use original stream
                streamToUse = originalStream;
            }

            try {
                // Determine resource type category from content type
                var resourceType = contentType.StartsWith("video/") ? "videos"
                    : contentType.StartsWith("audio/") ? "audio"
                    : "images";  // All images (PNG after conversion)

                // Create file data wrapper with updated metadata
                var fileData = new ConvertedFileData(fileName, contentType, streamToUse.Length, streamToUse);

                // Path: {resourceType}/{guid-last4}/{guid:32} for load balancing
                var guidString = guidId.ToString("N");
                var guidSuffix = guidString[^4..];
                var path = $"{resourceType}/{guidSuffix}/{guidString}";

                var data = await fileData.ToData(path, streamToUse);
                if (data.HasErrors) {
                    return Results.Problem(detail: $"""
                                              The resource file for the {request.Type} '{request.Id}' {request.Resource} is invalid.
                                              File name: "{fileName}"
                                              Reason: "{data.Errors[0].Message}"
                                              """,
                                            statusCode: StatusCodes.Status400BadRequest,
                                            title: "Invalid file data.");
                }
                // Parse entityId if provided
                Guid? parsedEntityId = null;
                if (!string.IsNullOrEmpty(entityId) && Guid.TryParse(entityId, out var entityGuid)) {
                    parsedEntityId = entityGuid;
                }

                var result = await storage.SaveResourceAsync(data.Value, streamToUse, userId, type, parsedEntityId, isPublic: false);
                return result.IsSuccessful
                    ? Results.Ok(new { id = guidId.ToString() })  // Return just the ID for frontend
                    : Results.Problem(detail: $"""
                                              There was a problem while uploading the resource file for the {request.Type} '{request.Id}' {request.Resource}.
                                              File name: "{fileName}"
                                              Reason: "{result.Errors[0].Message}"
                                              """,
                                      statusCode: StatusCodes.Status500InternalServerError,
                                      title: "Failed to upload resource file.");
            }
            finally {
                if (pngStream is not null)
                    await pngStream.DisposeAsync();
            }
        }
        catch (Exception ex) {
            return Results.Problem(detail: $"""
                                      There was a problem while uploading the resource file for the {request.Type} '{request.Id}' {request.Resource}.
                                      File name: "{request.File.FileName}"
                                      Exception: "{ex.GetType().Name}"
                                      Message: "{ex.Message}"
                                      """,
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "File upload error.");
        }
    }

    internal static async Task<IResult> DeleteFileHandler([FromRoute] Guid id,
                                                          [FromServices] IResourceService storage) {
        var result = await storage.DeleteResourceAsync(id);
        return result.IsSuccessful
            ? Results.NoContent()
            : Results.Problem(detail: $"Could not delete the resource {id}.",
                              statusCode: StatusCodes.Status500InternalServerError,
                              title: "Failed to delete resource.");
    }

    internal static async Task<IResult> DownloadFileHandler([FromRoute] Guid id,
                                                            [FromServices] IResourceService storage) {
        var download = await storage.ServeResourceAsync(id);
        if (download == null)
            return Results.NotFound();

        // Serve images inline for browser display, other files as attachment
        var isImage = download.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
        return isImage
            ? Results.File(download.Stream, download.ContentType)  // Inline display
            : Results.File(download.Stream, download.ContentType, download.FileName);  // Download attachment
    }
}

/// <summary>
/// Wrapper for converted file data with updated metadata.
/// </summary>
internal sealed class ConvertedFileData(string fileName, string contentType, long length, Stream stream) : IFileData {
    public string FileName { get; } = fileName;
    public string ContentType { get; } = contentType;
    public long Length { get; } = length;

    public Stream OpenReadStream() => stream;
}