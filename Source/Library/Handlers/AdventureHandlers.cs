using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

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
            Style = request.Style,
            BackgroundId = request.BackgroundId,
            IsOneShot = request.IsOneShot,
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
            Style = request.Style,
            IsOneShot = request.IsOneShot,
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

    internal static async Task<IResult> GetEncountersHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService)
        => Results.Ok(await adventureService.GetEncountersAsync(id));

    internal static async Task<IResult> AddNewEncounterHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.AddNewEncounterAsync(userId, id);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddClonedEncounterHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid encounterId, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.AddClonedEncounterAsync(userId, id, encounterId);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}