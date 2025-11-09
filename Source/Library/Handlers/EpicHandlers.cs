using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class EpicHandlers {
    internal static async Task<IResult> GetEpicsHandler(HttpContext context, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var epics = await epicService.GetEpicsAsync($"AvailableTo:{userId}");
        return Results.Ok(epics);
    }

    internal static async Task<IResult> GetEpicByIdHandler([FromRoute] Guid id, [FromServices] IEpicService epicService)
        => await epicService.GetEpicByIdAsync(id) is { } epic
               ? Results.Ok(epic)
               : Results.NotFound();

    internal static async Task<IResult> CreateEpicHandler(HttpContext context, [FromBody] CreateEpicRequest request, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var data = new CreateEpicData(userId) {
            Name = request.Name,
            Description = request.Description,
            BackgroundId = request.BackgroundId,
        };
        var result = await epicService.CreateEpicAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/epics/{result.Value.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> CloneEpicHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var result = await epicService.CloneEpicAsync(userId, id);
        return result.IsSuccessful
            ? Results.Created($"/api/epics/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateEpicHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateEpicRequest request, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var data = new UpdatedEpicData {
            Name = request.Name,
            Description = request.Description,
            BackgroundId = request.BackgroundId,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
        };
        var result = await epicService.UpdateEpicAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteEpicHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var result = await epicService.DeleteEpicAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetCampaignsHandler([FromRoute] Guid id, [FromServices] IEpicService epicService)
        => Results.Ok(await epicService.GetCampaignsAsync(id));

    internal static async Task<IResult> AddNewCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var result = await epicService.AddNewCampaignAsync(userId, id);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddClonedCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid campaignId, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var result = await epicService.AddClonedCampaignAsync(userId, id, campaignId);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid campaignId, [FromServices] IEpicService epicService) {
        var userId = context.User.GetUserId();
        var result = await epicService.RemoveCampaignAsync(userId, id, campaignId);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}
