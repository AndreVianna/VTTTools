using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Assets.Handlers;

internal static class AssetHandlers {
    internal static async Task<IResult> GetAssetsHandler([FromServices] IAssetService assetService)
        => Results.Ok(await assetService.GetAssetsAsync());

    internal static async Task<IResult> GetAssetByIdHandler([FromRoute] Guid id, [FromServices] IAssetService assetService)
        => await assetService.GetAssetAsync(id) is { } asset
               ? Results.Ok(asset)
               : Results.NotFound();

    internal static async Task<IResult> CreateAssetHandler(HttpContext context, [FromBody] CreateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        var created = await assetService.CreateAssetAsync(userId, request);
        return Results.Created($"/api/assets/{created.Id}", created);
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAssetRequest request, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        return await assetService.UpdateAssetAsync(userId, id, request) is { } asset
                   ? Results.Ok(asset)
                   : Results.NotFound();
    }

    internal static async Task<IResult> DeleteAssetHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        return await assetService.DeleteAssetAsync(userId, id)
                   ? Results.NoContent()
                   : Results.NotFound();
    }

    internal static async Task<IResult> UploadAssetFileHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromForm] IFormFile file,
        [FromServices] IMediaService storage,
        [FromServices] IAssetService assetService) {
        var userId = context.User.GetUserId();
        // ensure asset exists and belongs to user or admin
        var asset = await assetService.GetAssetAsync(id);
        if (asset is null || asset.OwnerId != userId)
            return Results.NotFound();
        // store file
        await using var stream = file.OpenReadStream();
        var url = await storage.UploadImageAsync(stream, file.FileName);
        // update asset source
        var update = new UpdateAssetRequest { Source = url };
        var updated = await assetService.UpdateAssetAsync(userId, id, update);
        return updated != null ? Results.Ok(updated) : Results.BadRequest();
    }
}