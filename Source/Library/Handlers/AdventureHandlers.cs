using IResult = Microsoft.AspNetCore.Http.IResult;
using static VttTools.Utilities.ErrorCollectionExtensions;

namespace VttTools.Library.Handlers;

internal static class AdventureHandlers {
    internal static async Task<IResult> GetAdventuresHandler(HttpContext context, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var adventures = await adventureService.GetAdventuresAsync($"AvailableTo:{userId}");
        return Results.Ok(adventures);
    }

    internal static async Task<IResult> GetAdventureByIdHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService)
        => await adventureService.GetAdventureByIdAsync(id) is { } adv
               ? Results.Ok(adv)
               : Results.NotFound();

    internal static async Task<IResult> CreateAdventureHandler(HttpContext context, [FromBody] CreateAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new CreateAdventureData {
            CampaignId = request.CampaignId,
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            BackgroundId = request.BackgroundId,
        };
        var result = await adventureService.CreateAdventureAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/adventures/{result.Value.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> CloneAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.CloneAdventureAsync(userId, id);
        return result.IsSuccessful
            ? Results.Created($"/api/adventures/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new UpdatedAdventureData {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            BackgroundId = request.BackgroundId,
            IsListed = request.IsPublished,
            IsPublic = request.IsPublic,
            CampaignId = request.CampaignId,
        };
        var result = await adventureService.UpdateAdventureAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.DeleteAdventureAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetScenesHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService)
        => Results.Ok(await adventureService.GetScenesAsync(id));

    internal static async Task<IResult> AddNewSceneHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.AddNewSceneAsync(userId, id);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddClonedSceneHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid sceneId, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.AddClonedSceneAsync(userId, id, sceneId);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}