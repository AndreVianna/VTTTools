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
        var userId = context.User.GetUserId();
        var data = new UpdateSceneData {
            AdventureId = request.AdventureId,
            Name = request.Name,
            Description = request.Description,
            Stage = request.Stage,
            IsListed = request.IsListed,
            IsPublic = request.IsPublic,
        };
        var result = await sceneService.UpdateSceneAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> GetAssetsHandler([FromRoute] Guid id, [FromServices] ISceneService sceneService)
        => Results.Ok(await sceneService.GetAssetsAsync(id));

    internal static async Task<IResult> AddClonedAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddClonedSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new AddClonedAssetData {
            Format = request.Format,
            Position = request.Position,
            Scale = request.Scale,
        };
        var result = await sceneService.AddClonedAssetAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> AddNewAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddNewSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new AddNewAssetData {
            Position = request.Position,
            Scale = request.Scale,
        };
        var result = await sceneService.AddNewAssetAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new UpdateSceneAssetData {
            AssetId = request.AssetId,
            Number = request.Number,
            Name = request.Name,
            Position = request.Position,
            Scale = request.Scale,
            IsLocked = request.IsLocked,
            ControlledBy = request.ControlledBy,
        };
        var result = await sceneService.UpdateAssetAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> RemoveAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromRoute] int number, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveAssetAsync(userId, id, assetId, number);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }
}