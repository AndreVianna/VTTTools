using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class SceneHandlers {
    internal static async Task<IResult> GetScenesHandler([FromServices] ISceneService sceneService)
        => Results.Ok(await sceneService.GetScenesAsync());

    internal static async Task<IResult> GetSceneByIdHandler([FromRoute] Guid id, [FromServices] ISceneService sceneService)
        => await sceneService.GetSceneByIdAsync(id) is { } ep
               ? Results.Ok(ep)
               : Results.NotFound();

    internal static async Task<IResult> UpdateSceneHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateSceneRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.ExtractUserId();
        return await sceneService.UpdateSceneAsync(userId, id, request) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound();
    }

    internal static async Task<IResult> GetAssetsHandler([FromRoute] Guid id, [FromServices] ISceneService sceneService)
        => Results.Ok(await sceneService.GetAssetsAsync(id));

    internal static async Task<IResult> AddAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.ExtractUserId();
        var data = new AddSceneAssetData {
            Id = request.Id,
            Position = request.Position,
        };
        var added = await sceneService.AddAssetAsync(userId, id, data);
        return added ? Results.NoContent() : Results.BadRequest();
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] UpdateSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.ExtractUserId();
        var data = new UpdateSceneAssetData {
            Position = request.Position,
        };
        var updated = await sceneService.UpdateAssetAsync(userId, id, assetId, data);
        return updated ? Results.NoContent() : Results.BadRequest();
    }

    internal static async Task<IResult> RemoveAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromServices] ISceneService sceneService) {
        var userId = context.User.ExtractUserId();
        var removed = await sceneService.RemoveAssetAsync(userId, id, assetId);
        return removed ? Results.NoContent() : Results.NotFound();
    }
}