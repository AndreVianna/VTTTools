using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class AdventureHandlers {
    internal static async Task<IResult> GetAdventuresHandler([FromServices] IAdventureService adventureService)
        => Results.Ok(await adventureService.GetAdventuresAsync());

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
            ImageId = request.ImageId,
        };
        var result = await adventureService.CreateAdventureAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/adventures/{result.Value.Id}", result.Value)
            : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> CloneAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] CloneAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new CloneAdventureData {
            TemplateId = id,
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            ImageId = request.ImageId,
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
        var data = new UpdateAdventureData {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            ImageId = request.ImageId,
            IsListed = request.IsListed,
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

    internal static async Task<IResult> AddNewSceneHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddNewSceneRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new AddNewSceneData {
            Name = request.Name,
            Description = request.Description,
            Stage = request.Stage,
        };
        var result = await adventureService.AddNewSceneAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> AddClonedSceneHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddClonedSceneRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new AddClonedSceneData {
            TemplateId = request.TemplateId,
            Name = request.Name,
            Description = request.Description,
        };
        var result = await adventureService.AddClonedSceneAsync(userId, id, data);
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