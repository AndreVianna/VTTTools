using static VttTools.Utilities.ErrorCollectionExtensions;

using BulkUpdateAssetsData = VttTools.Library.Scenes.ServiceContracts.BulkUpdateSceneAssetsData;
using IResult = Microsoft.AspNetCore.Http.IResult;
using SceneAssetUpdateData = VttTools.Library.Scenes.ServiceContracts.SceneAssetUpdateData;
using UpdateAssetData = VttTools.Library.Scenes.ServiceContracts.UpdateSceneAssetData;

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
            IsPublished = request.IsPublished,
            Stage = request.Stage.IsSet
                ? new UpdateSceneData.StageUpdate {
                    BackgroundId = request.Stage.Value.BackgroundId,
                    ZoomLevel = request.Stage.Value.ZoomLevel,
                    Panning = request.Stage.Value.Panning,
                }
                : new(),
            Grid = request.Grid.IsSet
                ? new UpdateSceneData.GridUpdate {
                    Type = request.Grid.Value.Type,
                    CellSize = request.Grid.Value.CellSize,
                    Offset = request.Grid.Value.Offset,
                    Snap = request.Grid.Value.Snap,
                }
                : new(),
        };
        var result = await sceneService.UpdateSceneAsync(userId, id, data);
        if (!result.IsSuccessful) {
            return result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
        }

        var updatedScene = await sceneService.GetSceneByIdAsync(id);
        return updatedScene is not null
            ? Results.Ok(updatedScene)
            : Results.NotFound();
    }

    internal static async Task<IResult> GetAssetsHandler([FromRoute] Guid id, [FromServices] ISceneService sceneService)
        => Results.Ok(await sceneService.GetAssetsAsync(id));

    internal static async Task<IResult> AddAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] AddSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new AddSceneAssetData {
            Name = request.Name,
            Description = request.Description,
            ResourceId = request.ResourceId,
            Position = request.Position,
            Size = request.Size,
            Frame = request.Frame,
            Elevation = request.Elevation,
            Rotation = request.Rotation,
        };
        var result = await sceneService.AddAssetAsync(userId, id, assetId, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> CloneAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.CloneAssetAsync(userId, id, index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] UpdateSceneAssetRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new UpdateAssetData {
            Name = request.Name,
            Position = request.Position,
            Size = request.Size,
            Frame = request.Frame,
            Elevation = request.Elevation,
            Rotation = request.Rotation,
            IsLocked = request.IsLocked,
            ControlledBy = request.ControlledBy,
        };
        var result = await sceneService.UpdateAssetAsync(userId, id, index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkUpdateAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] BulkUpdateSceneAssetsRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new BulkUpdateAssetsData {
            Updates = request.Updates.Select(u => new SceneAssetUpdateData {
                Index = u.Index,
                Position = u.Position,
                Size = u.Size,
                Rotation = u.Rotation,
                Elevation = u.Elevation,
            }).ToList()
        };
        var result = await sceneService.BulkUpdateAssetsAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkCloneAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] BulkCloneSceneAssetsRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.BulkCloneAssetsAsync(userId, id, request.AssetIndices);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkDeleteAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] BulkDeleteSceneAssetsRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.BulkDeleteAssetsAsync(userId, id, request.AssetIndices);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkAddAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] BulkAddSceneAssetsRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var assetsToAdd = request.Assets.Select(a => new AssetToAdd(
            a.AssetId,
            new AddSceneAssetData {
                Name = a.Name,
                Description = a.Description,
                ResourceId = a.ResourceId,
                Position = a.Position,
                Size = a.Size,
                Frame = new Frame(),
                Rotation = a.Rotation,
                Elevation = a.Elevation
            }
        )).ToList();
        var result = await sceneService.BulkAddAssetsAsync(userId, id, assetsToAdd);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveAssetAsync(userId, id, index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteSceneHandler(HttpContext context, [FromRoute] Guid id, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.DeleteSceneAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}