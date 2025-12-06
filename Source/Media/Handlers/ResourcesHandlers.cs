using VttTools.Media.ApiContracts;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

internal static class ResourcesHandlers {
    internal static async Task<IResult> FilterResourcesHandler(
        HttpContext context,
        [AsParameters] ResourceFilterData filter,
        [FromServices] IResourceService resourceService,
        CancellationToken ct) {
        var userId = context.User.GetUserId();

        var (items, totalCount) = await resourceService.FindResourcesAsync(userId, filter, ct);
        return Results.Ok(new { items, totalCount, skip = Math.Max(0, filter.Skip), take = Math.Clamp(filter.Take, 1, 100) });
    }

    internal static async Task<IResult> UploadResourceHandler(
        HttpContext context,
        [FromForm] string contentType,
        [FromForm] string fileName,
        [FromForm] IFormFile? file,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        var data = new UploadResourceData {
            ContentType = contentType,
            FileName = fileName,
            Stream = file?.OpenReadStream(),
        };

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

    internal static async Task<IResult> DeleteFileHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService) {
        var userId = context.User.GetUserId();

        var result = await resourceService.DeleteResourceAsync(userId, id);
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
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService) {
        var userId = context.User.GetUserId();

        var download = await resourceService.ServeResourceAsync(userId, id);
        if (download == null)
            return Results.NotFound();

        var isImage = download.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
        return isImage
            ? Results.File(download.Stream, download.ContentType)
            : Results.File(download.Stream, download.ContentType, download.FileName);
    }

    internal static async Task<IResult> GetResourceInfoHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IResourceService resourceService) {
        var userId = context.User.GetUserId();

        var resource = await resourceService.GetResourceAsync(userId, id);
        return resource is null
            ? Results.NotFound()
            : Results.Ok(resource);
    }

    internal static async Task<IResult> UpdateResourceHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateResourceRequest request,
        [FromServices] IResourceService resourceService) {
        var userId = context.User.GetUserId();

        var data = new UpdateResourceData {
            Description = request.Description,
            Features = request.Features,
            IsPublic = request.IsPublic,
        };

        var validationResult = data.Validate();
        if (!validationResult.IsSuccessful)
            return Results.BadRequest(validationResult.Errors);

        var result = await resourceService.UpdateResourceAsync(userId, id, data);
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