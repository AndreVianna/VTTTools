using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class RegionHandlers {
    internal static async Task<IResult> GetRegionsHandler(
        HttpContext context,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromServices] IRegionService regionService) {
        var userId = context.User.GetUserId();
        var regions = await regionService.GetRegionsAsync(userId, page, pageSize);
        return Results.Ok(regions);
    }

    internal static async Task<IResult> GetRegionByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IRegionService regionService) {
        var userId = context.User.GetUserId();
        var region = await regionService.GetRegionByIdAsync(id, userId);
        return region is not null ? Results.Ok(region) : Results.NotFound();
    }

    internal static async Task<IResult> CreateRegionHandler(
        HttpContext context,
        [FromBody] CreateRegionRequest request,
        [FromServices] IRegionService regionService) {
        var userId = context.User.GetUserId();
        var data = new CreateRegionData {
            Name = request.Name,
            Description = request.Description,
            RegionType = request.RegionType,
            LabelMap = request.LabelMap,
        };
        var result = await regionService.CreateRegionAsync(data, userId);
        return result.IsSuccessful
            ? Results.Created($"/api/library/regions/{result.Value!.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateRegionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateRegionRequest request,
        [FromServices] IRegionService regionService) {
        var userId = context.User.GetUserId();
        var data = new UpdateRegionData {
            Name = request.Name,
            Description = request.Description,
            RegionType = request.RegionType,
            LabelMap = request.LabelMap,
        };
        var result = await regionService.UpdateRegionAsync(id, data, userId);
        if (!result.IsSuccessful) {
            return result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
        }
        return Results.Ok(result.Value);
    }

    internal static async Task<IResult> DeleteRegionHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IRegionService regionService) {
        var userId = context.User.GetUserId();
        var result = await regionService.DeleteRegionAsync(id, userId);
        if (!result.IsSuccessful) {
            return result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
        }
        return Results.NoContent();
    }

    internal static async Task<IResult> PlaceSceneRegionHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromBody] PlaceSceneRegionRequest request,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.PlaceRegionAsync(
            sceneId,
            request.RegionId,
            request.Vertices,
            request.Value,
            userId);
        if (!result.IsSuccessful) {
            return result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
        }
        return Results.Created($"/api/scenes/{sceneId}/regions/{result.Value!.Id}", result.Value);
    }

    internal static async Task<IResult> UpdateSceneRegionHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromRoute] Guid id,
        [FromBody] UpdateSceneRegionRequest request,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.UpdateSceneRegionAsync(
            id,
            request.Vertices,
            request.Value,
            userId);
        if (!result.IsSuccessful) {
            return result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
        }
        return Results.Ok(result.Value);
    }

    internal static async Task<IResult> RemoveSceneRegionHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromRoute] Guid id,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveSceneRegionAsync(id, userId);
        if (!result.IsSuccessful) {
            return result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
        }
        return Results.NoContent();
    }
}
