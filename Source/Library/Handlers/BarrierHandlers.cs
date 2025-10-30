using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class BarrierHandlers {
    internal static async Task<IResult> GetBarriersHandler(
        HttpContext context,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromServices] IBarrierService barrierService) {
        var userId = context.User.GetUserId();
        var barriers = await barrierService.GetBarriersAsync(userId, page, pageSize);
        return Results.Ok(barriers);
    }

    internal static async Task<IResult> GetBarrierByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IBarrierService barrierService) {
        var userId = context.User.GetUserId();
        var barrier = await barrierService.GetBarrierByIdAsync(id, userId);
        return barrier is not null ? Results.Ok(barrier) : Results.NotFound();
    }

    internal static async Task<IResult> CreateBarrierHandler(
        HttpContext context,
        [FromBody] CreateBarrierRequest request,
        [FromServices] IBarrierService barrierService) {
        var userId = context.User.GetUserId();
        var data = new CreateBarrierData {
            Name = request.Name,
            Description = request.Description,
            Visibility = request.Visibility,
            IsClosed = request.IsClosed,
            Material = request.Material,
        };
        var result = await barrierService.CreateBarrierAsync(data, userId);
        return result.IsSuccessful
            ? Results.Created($"/api/library/barriers/{result.Value!.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateBarrierHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateBarrierRequest request,
        [FromServices] IBarrierService barrierService) {
        var userId = context.User.GetUserId();
        var data = new UpdateBarrierData {
            Name = request.Name,
            Description = request.Description,
            Visibility = request.Visibility,
            IsClosed = request.IsClosed,
            Material = request.Material,
        };
        var result = await barrierService.UpdateBarrierAsync(id, data, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.Ok(result.Value);
    }

    internal static async Task<IResult> DeleteBarrierHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IBarrierService barrierService) {
        var userId = context.User.GetUserId();
        var result = await barrierService.DeleteBarrierAsync(id, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.NoContent();
    }

    internal static async Task<IResult> PlaceSceneBarrierHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromBody] PlaceSceneBarrierRequest request,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.PlaceBarrierAsync(
            sceneId,
            request.BarrierId,
            request.Poles,
            userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.Created($"/api/scenes/{sceneId}/barriers/{result.Value!.Id}", result.Value);
    }

    internal static async Task<IResult> UpdateSceneBarrierHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromRoute] Guid id,
        [FromBody] UpdateSceneBarrierRequest request,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.UpdateSceneBarrierAsync(
            id,
            request.Poles,
            userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.Ok(result.Value);
    }

    internal static async Task<IResult> RemoveSceneBarrierHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromRoute] Guid id,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveSceneBarrierAsync(id, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.NoContent();
    }
}