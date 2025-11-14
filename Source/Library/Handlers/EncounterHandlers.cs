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
                    Snap = request.Grid.Value.Snap,
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
            TokenId = request.TokenId,
            PortraitId = request.PortraitId,
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
                TokenId = a.TokenId,
                PortraitId = a.PortraitId,
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
            Name = request.Name,
            Poles = request.Poles,
            Visibility = request.Visibility,
            IsClosed = request.IsClosed,
            Material = request.Material,
            Color = request.Color,
        };
        var result = await encounterService.AddWallAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterWallResponse {
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

    internal static async Task<IResult> UpdateWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterWallUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterWallUpdateData {
            Name = request.Name,
            Poles = request.Poles,
            Visibility = request.Visibility,
            IsClosed = request.IsClosed,
            Material = request.Material,
            Color = request.Color,
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
            Label = request.Label,
            Color = request.Color,
        };
        var result = await encounterService.AddRegionAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterRegionResponse {
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

    internal static async Task<IResult> UpdateRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterRegionUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterRegionUpdateData {
            Name = request.Name,
            Type = request.Type,
            Vertices = request.Vertices,
            Value = request.Value,
            Label = request.Label,
            Color = request.Color,
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

    internal static async Task<IResult> AddSourceHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterSourceAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterSourceAddData {
            Name = request.Name,
            Type = request.Type,
            Position = request.Position,
            IsDirectional = request.IsDirectional,
            Direction = request.Direction,
            Range = request.Range,
            Spread = request.Spread,
            HasGradient = request.HasGradient,
            Intensity = request.Intensity,
            Color = request.Color,
        };
        var result = await encounterService.AddSourceAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterSourceResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Type = result.Value.Type,
                Position = result.Value.Position,
                IsDirectional = result.Value.IsDirectional,
                Direction = result.Value.Direction,
                Range = result.Value.Range,
                Spread = result.Value.Spread,
                HasGradient = result.Value.HasGradient,
                Intensity = result.Value.Intensity,
                Color = result.Value.Color,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterSourceUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterSourceUpdateData {
            Name = request.Name,
            Type = request.Type,
            Position = request.Position,
            IsDirectional = request.IsDirectional,
            Direction = request.Direction,
            Range = request.Range,
            Spread = request.Spread,
            HasGradient = request.HasGradient,
            Intensity = request.Intensity,
            Color = request.Color,
        };
        var result = await encounterService.UpdateSourceAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveSourceHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveSourceAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> PlaceOpeningHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterOpeningAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterOpeningAddData {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            WallIndex = request.WallIndex,
            CenterPosition = request.CenterPosition,
            Width = request.Width,
            Height = request.Height,
            Visibility = request.Visibility,
            State = request.State,
            Opacity = request.Opacity,
            Material = request.Material,
            Color = request.Color,
        };
        var result = await encounterService.PlaceOpeningAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(new EncounterOpeningResponse {
                Index = result.Value.Index,
                Name = result.Value.Name,
                Description = result.Value.Description,
                Type = result.Value.Type,
                WallIndex = result.Value.WallIndex,
                StartPoleIndex = result.Value.StartPoleIndex,
                EndPoleIndex = result.Value.EndPoleIndex,
                Width = result.Value.Size.Width,
                Height = result.Value.Size.Height,
                Visibility = result.Value.Visibility,
                State = result.Value.State,
                Opacity = result.Value.Opacity,
                Material = result.Value.Material,
                Color = result.Value.Color,
            })
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateOpeningHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterOpeningUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterOpeningUpdateData {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Width = request.Width,
            Height = request.Height,
            Visibility = request.Visibility,
            State = request.State,
            Opacity = request.Opacity,
            Material = request.Material,
            Color = request.Color,
        };
        var result = await encounterService.UpdateOpeningAsync(userId, id, (uint)index, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveOpeningHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveOpeningAsync(userId, id, (uint)index);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}