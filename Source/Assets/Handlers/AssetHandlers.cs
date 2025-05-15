using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Assets.Handlers;

internal static class AssetHandlers {
    internal static async Task<IResult> GetAssetsHandler([FromServices] IAssetService assetService)
        => Results.Ok(await assetService.GetAssetsAsync());

    internal static async Task<IResult> GetAssetByIdHandler([FromRoute] Guid id, [FromServices] IAssetService assetService)
        => await assetService.GetAssetByIdAsync(id) is { } asset
               ? Results.Ok(asset)
               : Results.NotFound();

    internal static async Task<IResult> CreateAssetHandler(HttpContext context, [FromBody] CreateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var data = new CreateAssetData {
            Name = request.Name,
            Type = request.Type,
            Description = request.Description,
            Display = request.Display,
        };
        var result = await assetService.CreateAssetAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/assets/{result.Value.Id}", result.Value)
            : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> CloneAssetHandler(HttpContext context, [FromBody] CloneAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var data = new CloneAssetData {
            Name = request.Name,
            Description = request.Description,
            Display = request.Display,
        };
        var result = await assetService.CloneAssetAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/assets/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var data = new UpdateAssetData {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Display = request.Display,
            IsListed = request.IsListed,
            IsPublic = request.IsPublic,
        };
        var result = await assetService.UpdateAssetAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Created($"/api/assets/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> DeleteAssetHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var result = await assetService.DeleteAssetAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> UploadAssetFileHandler(HttpContext context,
                                                               [FromRoute] Guid id,
                                                               [FromForm] IFormFile file,
                                                               [FromServices] IMediaService storage,
                                                               [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var asset = await assetService.GetAssetByIdAsync(id);
        if (asset is null || asset.OwnerId != userId) return Results.NotFound();
        await using var stream = file.OpenReadStream();
        var result = await storage.UploadImageAsync(id, file.FileName, stream);
        return result.IsSuccessful
            ? Results.NoContent()
            : Results.Problem(detail: $"""
                                      The image file for asset '{id}' was not saved in the media storage.
                                      File name: "{file.FileName}"
                                      Reason: "{result.Errors[0].Message}"
                                      """,
                              statusCode: StatusCodes.Status500InternalServerError,
                              title: "Failed to save the asset image.");
    }
}