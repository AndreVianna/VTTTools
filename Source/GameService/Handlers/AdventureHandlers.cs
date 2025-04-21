using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.GameService.Handlers;

internal static class AdventureHandlers {
    internal static async Task<IResult> GetAdventuresHandler([FromServices] IAdventureService adventureService)
        => Results.Ok(await adventureService.GetAdventuresAsync());

    internal static async Task<IResult> GetAdventureByIdHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService)
        => await adventureService.GetAdventureAsync(id) is { } adv
               ? Results.Ok(adv)
               : Results.NotFound();

    internal static async Task<IResult> GetEpisodesHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService) => Results.Ok(await adventureService.GetEpisodesAsync(id));

    internal static async Task<IResult> CreateEpisodeHandler(HttpContext context, [FromRoute] Guid id, [FromBody] CreateEpisodeRequest request, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var created = await adventureService.CreateEpisodeAsync(userId, id, request);
        return created != null
                   ? Results.Created($"/api/episodes/{created.Id}", created)
                   : Results.BadRequest();
    }

    internal static async Task<IResult> CreateAdventureHandler(HttpContext context, [FromBody] CreateAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var created = await adventureService.CreateAdventureAsync(userId, request);
        return created != null
                   ? Results.Created($"/api/adventures/{created.Id}", created)
                   : Results.BadRequest();
    }

    internal static async Task<IResult> UpdateAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAdventureRequest request, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var updated = await adventureService.UpdateAdventureAsync(userId, id, request);
        return updated != null ? Results.Ok(updated) : Results.NotFound();
    }

    internal static async Task<IResult> DeleteAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var deleted = await adventureService.DeleteAdventureAsync(userId, id);
        return deleted ? Results.NoContent() : Results.NotFound();
    }

    internal static async Task<IResult> CloneAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var clone = await adventureService.CloneAdventureAsync(userId, id);
        return clone != null
                   ? Results.Created($"/api/adventures/{clone.Id}", clone)
                   : Results.NotFound();
    }
}