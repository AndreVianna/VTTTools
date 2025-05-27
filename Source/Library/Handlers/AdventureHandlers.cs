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
        var data = new NewAdventureData {
            CampaignId = request.CampaignId,
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Display = request.Display,
        };
        var result = await adventureService.CreateAdventureAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/adventures/{result.Value.Id}", result.Value)
            : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> CloneAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] CloneAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new ClonedAdventureData {
            TemplateId = id,
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Display = request.Display,
            IncludeScenes = request.IncludeScenes,
        };
        var result = await adventureService.CloneAdventureAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/adventures/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> UpdateAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new UpdatedAdventureData {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Display = request.Display,
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
                    : Results.BadRequest(result.Errors);
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
                    : Results.BadRequest(result.Errors);
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
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> AddClonedSceneHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid templateId, [FromBody] CloneSceneRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new ClonedSceneData {
            Name = request.Name,
            Description = request.Description,
            Stage = request.Display,
            ZoomLevel = request.ZoomLevel,
            Grid = request.Grid,
        };
        var result = await adventureService.AddClonedSceneAsync(userId, id, templateId, data);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> RemoveSceneHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid sceneId, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var result = await adventureService.RemoveSceneAsync(userId, id, sceneId);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }
}