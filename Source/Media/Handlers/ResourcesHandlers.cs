using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

internal static class ResourcesHandlers {
    internal static async Task<IResult> FilterResourcesHandler(
        HttpContext context,
        [AsParameters] ResourceFilterRequest request,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        // Internal services can query all resources without user-scoping
        var isInternalService = context.IsInternalService();
        var userId = isInternalService ? (Guid?)null : context.User.GetUserId();

        var filter = new ResourceFilterData {
            Role = request.Role,
            SearchText = request.SearchText,
            MediaTypes = request.MediaTypes,
            MinWidth = request.MinWidth,
            MaxWidth = request.MaxWidth,
            MinDurationMs = request.MinDurationMs,
            MaxDurationMs = request.MaxDurationMs,
            OwnerId = request.OwnerId,
            Skip = request.Skip ?? 0,
            Take = request.Take ?? 50,
        };

        var validationResult = filter.Validate();
        if (!validationResult.IsSuccessful)
            return Results.BadRequest(validationResult.Errors);

        var response = await resourceService.FindResourcesAsync(userId, filter, ct);
        return Results.Ok(new {
            items = response.Items,
            totalCount = response.TotalCount,
            maxVideoDurationMs = response.MaxVideoDurationMs,
            maxAudioDurationMs = response.MaxAudioDurationMs,
            skip = Math.Max(0, filter.Skip),
            take = Math.Clamp(filter.Take, 1, 100),
        });
    }

    internal static async Task<IResult> UploadResourceHandler(
        HttpContext context,
        [FromForm] IFormFile file,
        [FromForm] string? role,
        [FromForm] string? ownerId,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        Guid userId;
        if (context.IsInternalService()) {
            // Internal service calls must provide OwnerId
            if (string.IsNullOrWhiteSpace(ownerId) || !Guid.TryParse(ownerId, out var parsedOwnerId))
                return Results.BadRequest(new { error = "OwnerId is required for internal service calls." });
            userId = parsedOwnerId;
        }
        else {
            userId = context.User.GetUserId();
        }

        var parsedRole = Enum.TryParse<ResourceRole>(role, ignoreCase: true, out var r)
            ? r
            : ResourceRole.Undefined;

        var data = new UploadResourceData {
            Role = parsedRole,
            ContentType = file.ContentType,
            FileName = file.FileName,
            Stream = file.OpenReadStream(),
        };

        var validationResult = data.Validate();
        if (!validationResult.IsSuccessful)
            return Results.BadRequest(validationResult.Errors);

        var result = await resourceService.UploadResourceAsync(userId, data, ct);
        if (result.IsSuccessful)
            return Results.Ok(result.Value);

        var errorMessage = result.Errors[0].Message;
        var statusCode = DetermineStatusCode(errorMessage);

        return Results.Problem(
            detail: errorMessage,
            statusCode: statusCode,
            title: GetErrorTitle(statusCode));
    }

    private static int DetermineStatusCode(string errorMessage)
        => errorMessage.Contains("Invalid file format", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status400BadRequest
         : errorMessage.Contains("File size", StringComparison.OrdinalIgnoreCase) && errorMessage.Contains("exceeds maximum", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status413RequestEntityTooLarge
         : errorMessage.Contains("processing failed", StringComparison.OrdinalIgnoreCase) || errorMessage.Contains("Invalid file data", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status400BadRequest
         : errorMessage.Contains("Failed to save", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status500InternalServerError
         : StatusCodes.Status400BadRequest;

    private static string GetErrorTitle(int statusCode)
        => statusCode switch {
            StatusCodes.Status400BadRequest => "Invalid request",
            StatusCodes.Status413RequestEntityTooLarge => "File too large",
            StatusCodes.Status500InternalServerError => "Upload failed",
            _ => "Upload error"
        };

    internal static async Task<IResult> DeleteResourceHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        Guid userId;
        if (context.IsInternalService()) {
            // Internal service calls must provide X-User-Id header
            if (!context.Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) || !Guid.TryParse(userIdHeader, out userId))
                return Results.BadRequest(new { error = "X-User-Id header is required for internal service calls." });
        }
        else {
            userId = context.User.GetUserId();
        }

        var result = await resourceService.DeleteResourceAsync(userId, id, ct);
        return !result.IsSuccessful
            ? result.Errors[0].Message switch {
                "NotFound" => Results.NotFound(),
                "NotAllowed" => Results.Forbid(),
                _ => Results.Problem(detail: $"Could not delete the resource {id}.",
                                     statusCode: StatusCodes.Status500InternalServerError,
                                     title: "Failed to delete resource."),
            }
            : Results.NoContent();
    }

    internal static async Task<IResult> ServeResourceHandler(
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        var download = await resourceService.ServeResourceAsync(id, ct);
        if (download is null) {
            // Return error placeholder (resource ID exists but processing failed)
            var assembly = typeof(ResourcesHandlers).Assembly;
            var stream = assembly.GetManifestResourceStream("VttTools.Media.Resources.error-placeholder.png");
            return stream is not null
                ? Results.File(stream, "image/png")
                : Results.NotFound();
        }

        var isImage = download.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
        return isImage
            ? Results.File(download.Stream, download.ContentType)
            : Results.File(download.Stream, download.ContentType, download.FileName);
    }

    internal static async Task<IResult> ServeThumbnailHandler(
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        var thumbnail = await resourceService.ServeThumbnailAsync(id, ct);
        if (thumbnail is null) {
            // Try the full resource as fallback (images don't have separate thumbnails)
            var resource = await resourceService.ServeResourceAsync(id, ct);
            if (resource?.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) == true)
                return Results.File(resource.Stream, resource.ContentType);

            // Return placeholder if no thumbnail and not an image
            var assembly = typeof(ResourcesHandlers).Assembly;
            var stream = assembly.GetManifestResourceStream("VttTools.Media.Resources.error-placeholder.png");
            return stream is not null
                ? Results.File(stream, "image/png")
                : Results.NotFound();
        }

        return Results.File(thumbnail.Stream, thumbnail.ContentType);
    }

    internal static async Task<IResult> GetResourceInfoHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        var userId = context.User.GetUserId();

        var resource = await resourceService.GetResourceAsync(userId, id, ct);
        return resource is null
            ? Results.NotFound()
            : Results.Ok(resource);
    }

    internal static async Task<IResult> UpdateResourceHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateResourceRequest request,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {
        var userId = context.User.GetUserId();

        var data = new UpdateResourceData {
            Role = request.Role,
        };

        var validationResult = data.Validate();
        if (!validationResult.IsSuccessful)
            return Results.BadRequest(validationResult.Errors);

        var result = await resourceService.UpdateResourceAsync(userId, id, data, ct);
        return !result.IsSuccessful
            ? result.Errors[0].Message switch {
                "NotFound" => Results.NotFound(),
                "NotAllowed" => Results.Forbid(),
                _ => Results.Problem(detail: $"Could not update the resource {id}.",
                                     statusCode: StatusCodes.Status500InternalServerError,
                                     title: "Failed to update resource."),
            }
            : Results.NoContent();
    }
}