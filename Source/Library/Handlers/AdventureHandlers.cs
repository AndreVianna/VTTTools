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
            Visibility = request.Visibility,
        };
        var created = await adventureService.CreateAdventureAsync(userId, data);
        return created != null
                   ? Results.Created($"/api/adventures/{created.Id}", created)
                   : Results.BadRequest();
    }

    internal static async Task<IResult> UpdateAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new UpdateAdventureData {
            Name = request.Name,
            Visibility = request.Visibility,
        };
        var updated = await adventureService.UpdateAdventureAsync(userId, id, data);
        return updated != null ? Results.Ok(updated) : Results.NotFound();
    }

    internal static async Task<IResult> DeleteAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var deleted = await adventureService.DeleteAdventureAsync(userId, id);
        return deleted ? Results.NoContent() : Results.NotFound();
    }

    internal static async Task<IResult> CloneAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] CloneAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new CloneAdventureData {
            CampaignId = request.CampaignId,
            Name = request.Name,
        };
        var clone = await adventureService.CloneAdventureAsync(userId, id, data);
        return clone != null
                   ? Results.Created($"/api/adventures/{clone.Id}", clone)
                   : Results.NotFound();
    }

    internal static async Task<IResult> GetScenesHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService)
        => Results.Ok(await adventureService.GetScenesAsync(id));

    internal static async Task<IResult> CreateSceneHandler(HttpContext context, [FromRoute] Guid id, [FromBody] CreateSceneRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new CreateSceneData {
            Name = request.Name,
            Visibility = request.Visibility,
        };
        var added = await adventureService.CreateSceneAsync(userId, id, data);
        return added ? Results.NoContent() : Results.BadRequest();
    }

    internal static async Task<IResult> AddClonedSceneHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddClonedSceneRequest request, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var data = new AddClonedSceneData {
            SceneId = request.SceneId,
            Name = request.Name,
        };
        var added = await adventureService.AddClonedSceneAsync(userId, id, data);
        return added ? Results.NoContent() : Results.BadRequest();
    }

    internal static async Task<IResult> RemoveSceneHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid sceneId, [FromServices] IAdventureService adventureService) {
        var userId = context.User.GetUserId();
        var removed = await adventureService.RemoveSceneAsync(userId, id, sceneId);
        return removed ? Results.NoContent() : Results.NotFound();
    }
}