using static VttTools.Utilities.ErrorCollectionExtensions;

using BulkUpdateAssetsData = VttTools.Library.Scenes.ServiceContracts.SceneAssetBulkUpdateData;
using IResult = Microsoft.AspNetCore.Http.IResult;
using UpdateAssetData = VttTools.Library.Scenes.ServiceContracts.SceneAssetUpdateData;

namespace VttTools.Library.Handlers;

internal static class SceneHandlers {
    internal static async Task<IResult> GetScenesHandler([FromServices] ISceneService sceneService)
        => Results.Ok(await sceneService.GetScenesAsync());

    internal static async Task<IResult> GetSceneByIdHandler([FromRoute] Guid id, [FromServices] ISceneService sceneService)
        => await sceneService.GetSceneByIdAsync(id) is { } ep
               ? Results.Ok(ep)
               : Results.NotFound();

    internal static async Task<IResult> UpdateSceneHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneUpdateRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneUpdateData {
            AdventureId = request.AdventureId,
            Name = request.Name,
            Description = request.Description,
            IsPublished = request.IsPublished,
            Stage = request.Stage.IsSet
                ? new SceneUpdateData.StageUpdate {
                    BackgroundId = request.Stage.Value.BackgroundId,
                    ZoomLevel = request.Stage.Value.ZoomLevel,
                    Panning = request.Stage.Value.Panning,
                }
                : new(),
            Grid = request.Grid.IsSet
                ? new SceneUpdateData.GridUpdate {
                    Type = request.Grid.Value.Type,
                    CellSize = request.Grid.Value.CellSize,
                    Offset = request.Grid.Value.Offset,
                    Snap = request.Grid.Value.Snap,
                }
                : new(),
        };
        var result = await sceneService.UpdateSceneAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetAssetsHandler([FromRoute] Guid id, [FromServices] ISceneService sceneService)
        => Results.Ok(await sceneService.GetAssetsAsync(id));

    internal static async Task<IResult> AddAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] SceneAssetAddRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneAssetAddData {
            Name = request.Name,
            IsVisible = request.IsVisible,
            TokenId = request.TokenId,
            PortraitId = request.PortraitId,
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

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] SceneAssetUpdateRequest request, [FromServices] ISceneService sceneService) {
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

    internal static async Task<IResult> BulkUpdateAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneAssetBulkUpdateRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new BulkUpdateAssetsData {
            Updates = [.. request.Updates.Select(u => new SceneAssetBulkUpdateDataItem {
                Index = u.Index,
                Position = u.Position,
                Size = u.Size,
                Rotation = u.Rotation,
                Elevation = u.Elevation,
            })]
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

    internal static async Task<IResult> BulkCloneAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneAssetBulkCloneRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.BulkCloneAssetsAsync(userId, id, request.Indices);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkDeleteAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneAssetBulkDeleteRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.BulkDeleteAssetsAsync(userId, id, request.Indices);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkAddAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneAssetBulkAddRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var assetsToAdd = request.Assets.ConvertAll(a => new AssetToAdd(
            a.Id,
            new SceneAssetAddData {
                Name = a.Name,
                IsVisible = a.IsVisible,
                TokenId = a.TokenId,
                PortraitId = a.PortraitId,
                Position = a.Position,
                Size = a.Size,
                Frame = a.Frame,
                Rotation = a.Rotation,
                Elevation = a.Elevation
            }
        ));
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

    internal static async Task<IResult> AddWallHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneWallAddRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneWallAddData {
            Name = request.Name,
            Poles = request.Poles,
            Visibility = request.Visibility,
            IsClosed = request.IsClosed,
            Material = request.Material,
            Color = request.Color,
        };
        var result = await sceneService.AddWallAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new SceneWallResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Poles = [.. result.Value.Poles],
                Visibility = result.Value.Visibility,
                IsClosed = result.Value.IsClosed,
                Material = result.Value.Material,
                Color = result.Value.Color,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] SceneWallUpdateRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneWallUpdateData {
            Name = request.Name,
            Poles = request.Poles,
            Visibility = request.Visibility,
            IsClosed = request.IsClosed,
            Material = request.Material,
            Color = request.Color,
        };
        var result = await sceneService.UpdateWallAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveWallAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddRegionHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneRegionAddRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneRegionAddData {
            Name = request.Name,
            Type = request.Type,
            Vertices = request.Vertices,
            Value = request.Value,
            Label = request.Label,
            Color = request.Color,
        };
        var result = await sceneService.AddRegionAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new SceneRegionResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Type = result.Value.Type,
                Vertices = [.. result.Value.Vertices],
                Value = result.Value.Value,
                Label = result.Value.Label,
                Color = result.Value.Color,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] SceneRegionUpdateRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneRegionUpdateData {
            Name = request.Name,
            Type = request.Type,
            Vertices = request.Vertices,
            Value = request.Value,
            Label = request.Label,
            Color = request.Color,
        };
        var result = await sceneService.UpdateRegionAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveRegionAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddSourceHandler(HttpContext context, [FromRoute] Guid id, [FromBody] SceneSourceAddRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneSourceAddData {
            Name = request.Name,
            Type = request.Type,
            Position = request.Position,
            Direction = request.Direction,
            Range = request.Range,
            Intensity = request.Intensity,
            HasGradient = request.HasGradient,
        };
        var result = await sceneService.AddSourceAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new SceneSourceResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Type = result.Value.Type,
                Position = result.Value.Position,
                Direction = result.Value.Direction,
                Range = result.Value.Range,
                Intensity = result.Value.Intensity,
                HasGradient = result.Value.HasGradient,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] SceneSourceUpdateRequest request, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new SceneSourceUpdateData {
            Name = request.Name,
            Type = request.Type,
            Position = request.Position,
            Direction = request.Direction,
            Range = request.Range,
            Intensity = request.Intensity,
            HasGradient = request.HasGradient,
        };
        var result = await sceneService.UpdateSourceAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveSourceAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}