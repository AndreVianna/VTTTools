using static VttTools.Utilities.ErrorCollectionExtensions;

using BulkUpdateAssetsData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetBulkUpdateData;
using IResult = Microsoft.AspNetCore.Http.IResult;
using UpdateAssetData = VttTools.Library.Encounters.ServiceContracts.EncounterAssetUpdateData;

namespace VttTools.Library.Handlers;

internal static class EncounterHandlers {
    internal static async Task<IResult> GetEncountersHandler([FromServices] IEncounterService encounterService)
        => Results.Ok(await encounterService.GetEncountersAsync());

    internal static async Task<IResult> GetEncounterByIdHandler([FromRoute] Guid id, [FromServices] IEncounterService encounterService)
        => await encounterService.GetEncounterByIdAsync(id) is { } ep
               ? Results.Ok(ep)
               : Results.NotFound();

    internal static async Task<IResult> UpdateEncounterHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterUpdateData {
            AdventureId = request.AdventureId,
            Name = request.Name,
            Description = request.Description,
            IsPublished = request.IsPublished,
            Stage = request.Stage.IsSet
                ? new EncounterUpdateData.StageUpdate {
                    BackgroundId = request.Stage.Value.BackgroundId,
                    ZoomLevel = request.Stage.Value.ZoomLevel,
                    Panning = request.Stage.Value.Panning,
                }
                : new(),
            Grid = request.Grid.IsSet
                ? new EncounterUpdateData.GridUpdate {
                    Type = request.Grid.Value.Type,
                    CellSize = request.Grid.Value.CellSize,
                    Offset = request.Grid.Value.Offset,
                }
                : new(),
        };
        var result = await encounterService.UpdateEncounterAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetAssetsHandler([FromRoute] Guid id, [FromServices] IEncounterService encounterService)
        => Results.Ok(await encounterService.GetAssetsAsync(id));

    internal static async Task<IResult> AddAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] EncounterAssetAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterAssetAddData {
            Name = request.Name,
            IsVisible = request.IsVisible,
            ImageId = request.ImageId,
            Position = request.Position,
            Size = request.Size,
            Frame = request.Frame,
            Elevation = request.Elevation,
            Rotation = request.Rotation,
        };
        var result = await encounterService.AddAssetAsync(userId, id, assetId, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> CloneAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.CloneAssetAsync(userId, id, index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterAssetUpdateRequest request, [FromServices] IEncounterService encounterService) {
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
        var result = await encounterService.UpdateAssetAsync(userId, id, index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkUpdateAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterAssetBulkUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new BulkUpdateAssetsData {
            Updates = [.. request.Updates.Select(u => new EncounterAssetBulkUpdateDataItem {
                Index = u.Index,
                Position = u.Position,
                Size = u.Size,
                Rotation = u.Rotation,
                Elevation = u.Elevation,
            })]
        };
        var result = await encounterService.BulkUpdateAssetsAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkCloneAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterAssetBulkCloneRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.BulkCloneAssetsAsync(userId, id, request.Indices);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkDeleteAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterAssetBulkDeleteRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.BulkDeleteAssetsAsync(userId, id, request.Indices);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> BulkAddAssetsHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterAssetBulkAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var assetsToAdd = request.Assets.ConvertAll(a => new AssetToAdd(
            a.Id,
            new EncounterAssetAddData {
                Name = a.Name,
                IsVisible = a.IsVisible,
                ImageId = a.ImageId,
                Position = a.Position,
                Size = a.Size,
                Frame = a.Frame,
                Rotation = a.Rotation,
                Elevation = a.Elevation
            }
        ));
        var result = await encounterService.BulkAddAssetsAsync(userId, id, assetsToAdd);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveAssetAsync(userId, id, index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteEncounterHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.DeleteEncounterAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddWallHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterWallAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterWallAddData {
            Segments = request.Segments,
        };
        var result = await encounterService.AddWallAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterWallResponse {
                Index = result.Value.Index,
                Segments = [.. result.Value.Segments],
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterWallUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterWallUpdateData {
            Segments = request.Segments,
        };
        var result = await encounterService.UpdateWallAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveWallAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddRegionHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterRegionAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterRegionAddData {
            Name = request.Name,
            Type = request.Type,
            Vertices = request.Vertices,
            Value = request.Value,
        };
        var result = await encounterService.AddRegionAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterRegionResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Type = result.Value.Type,
                Vertices = [.. result.Value.Vertices],
                Value = result.Value.Value,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterRegionUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterRegionUpdateData {
            Name = request.Name,
            Type = request.Type,
            Vertices = request.Vertices,
            Value = request.Value,
        };
        var result = await encounterService.UpdateRegionAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveRegionAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddLightSourceHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterLightAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterLightAddData {
            Name = request.Name,
            Type = request.Type,
            Position = request.Position,
            Range = request.Range,
            Direction = request.Direction,
            Arc = request.Arc,
            Color = request.Color,
            IsOn = request.IsOn,
        };
        var result = await encounterService.AddLightSourceAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterLightResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Type = result.Value.Type,
                Position = result.Value.Position,
                Range = result.Value.Range,
                Direction = result.Value.Direction,
                Arc = result.Value.Arc,
                Color = result.Value.Color,
                IsOn = result.Value.IsOn,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateLightSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterLightUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterLightUpdateData {
            Name = request.Name,
            Type = request.Type,
            Position = request.Position,
            Range = request.Range,
            Direction = request.Direction,
            Arc = request.Arc,
            Color = request.Color,
            IsOn = request.IsOn,
        };
        var result = await encounterService.UpdateLightSourceAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveLightSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveLightSourceAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddSoundSourceHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterSoundAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterSoundAddData {
            Name = request.Name,
            Position = request.Position,
            Range = request.Range,
            ResourceId = request.ResourceId,
            IsPlaying = request.IsPlaying,
            Loop = request.Loop,
        };
        var result = await encounterService.AddSoundSourceAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterSoundResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Position = result.Value.Position,
                Range = result.Value.Range,
                ResourceId = result.Value.Resource?.Id,
                IsPlaying = result.Value.IsPlaying,
                Loop = result.Value.Loop,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateSoundSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterSoundUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterSoundUpdateData {
            Name = request.Name,
            Position = request.Position,
            Range = request.Range,
            ResourceId = request.ResourceId,
            IsPlaying = request.IsPlaying,
            Loop = request.Loop,
        };
        var result = await encounterService.UpdateSoundSourceAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveSoundSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveSoundSourceAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}