using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.GameService.Handlers;

internal static class EpisodeHandlers {
    internal static async Task<IResult> GetEpisodeByIdHandler([FromRoute] Guid id, [FromServices] IAdventureService adventureService)
        => await adventureService.GetEpisodeAsync(id) is { } ep
               ? Results.Ok(ep)
               : Results.NotFound();

    internal static async Task<IResult> UpdateEpisodeHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateEpisodeRequest request, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        return await adventureService.UpdateEpisodeAsync(userId, id, request) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound();
    }

    internal static async Task<IResult> DeleteEpisodeHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        return await adventureService.DeleteEpisodeAsync(userId, id)
                   ? Results.NoContent()
                   : Results.NotFound();
    }

    internal static async Task<IResult> CloneEpisodeHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        return await adventureService.CloneEpisodeAsync(userId, id) is { } clone
                   ? Results.Created($"/api/episodes/{clone.Id}", clone)
                   : Results.NotFound();
    }
}