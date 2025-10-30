using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class SourceHandlers {
    internal static async Task<IResult> GetSourcesHandler(
        HttpContext context,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromServices] ISourceService sourceService) {
        var userId = context.User.GetUserId();
        var sources = await sourceService.GetSourcesAsync(userId, page, pageSize);
        return Results.Ok(sources);
    }

    internal static async Task<IResult> GetSourceByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] ISourceService sourceService) {
        var userId = context.User.GetUserId();
        var source = await sourceService.GetSourceByIdAsync(id, userId);
        return source is not null ? Results.Ok(source) : Results.NotFound();
    }

    internal static async Task<IResult> CreateSourceHandler(
        HttpContext context,
        [FromBody] CreateSourceRequest request,
        [FromServices] ISourceService sourceService) {
        var userId = context.User.GetUserId();
        var data = new CreateSourceData {
            Name = request.Name,
            Description = request.Description,
            SourceType = request.SourceType,
            DefaultRange = request.DefaultRange,
            DefaultIntensity = request.DefaultIntensity,
            DefaultIsGradient = request.DefaultIsGradient,
        };
        var result = await sourceService.CreateSourceAsync(data, userId);
        return result.IsSuccessful
            ? Results.Created($"/api/library/sources/{result.Value!.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateSourceHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateSourceRequest request,
        [FromServices] ISourceService sourceService) {
        var userId = context.User.GetUserId();
        var data = new UpdateSourceData {
            Name = request.Name,
            Description = request.Description,
            SourceType = request.SourceType,
            DefaultRange = request.DefaultRange,
            DefaultIntensity = request.DefaultIntensity,
            DefaultIsGradient = request.DefaultIsGradient,
        };
        var result = await sourceService.UpdateSourceAsync(id, data, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.Ok(result.Value);
    }

    internal static async Task<IResult> DeleteSourceHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] ISourceService sourceService) {
        var userId = context.User.GetUserId();
        var result = await sourceService.DeleteSourceAsync(id, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.NoContent();
    }

    internal static async Task<IResult> PlaceSceneSourceHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromBody] PlaceSceneSourceRequest request,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new PlaceSceneSourceData {
            SourceId = request.SourceId,
            Position = request.Position,
            Range = request.Range,
            Intensity = request.Intensity,
            IsGradient = request.IsGradient,
        };
        var result = await sceneService.PlaceSourceAsync(sceneId, data, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.Created($"/api/scenes/{sceneId}/sources/{result.Value!.Id}", result.Value);
    }

    internal static async Task<IResult> UpdateSceneSourceHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromRoute] Guid id,
        [FromBody] UpdateSceneSourceRequest request,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var data = new UpdateSceneSourceData {
            Position = request.Position ?? Point.Zero,
            Range = request.Range ?? default,
            Intensity = request.Intensity ?? default,
            IsGradient = request.IsGradient ?? default,
        };
        var result = await sceneService.UpdateSceneSourceAsync(id, data, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.Ok(result.Value);
    }

    internal static async Task<IResult> RemoveSceneSourceHandler(
        HttpContext context,
        [FromRoute] Guid sceneId,
        [FromRoute] Guid id,
        [FromServices] ISceneService sceneService) {
        var userId = context.User.GetUserId();
        var result = await sceneService.RemoveSceneSourceAsync(id, userId);
        return !result.IsSuccessful
            ? result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource())
            : Results.NoContent();
    }
}