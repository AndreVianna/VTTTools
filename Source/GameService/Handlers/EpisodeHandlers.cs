using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.GameService.Handlers;

internal static class EpisodeHandlers {
    internal static async Task<IResult> GetEpisodesHandler([FromServices] IEpisodeService episodeService)
        => Results.Ok(await episodeService.GetEpisodesAsync());

    internal static async Task<IResult> GetEpisodeByIdHandler([FromRoute] Guid id, [FromServices] IEpisodeService episodeService)
        => await episodeService.GetEpisodeByIdAsync(id) is { } ep
               ? Results.Ok(ep)
               : Results.NotFound();

    internal static async Task<IResult> UpdateEpisodeHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateEpisodeRequest request, [FromServices] IEpisodeService episodeService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        return await episodeService.UpdateEpisodeAsync(userId, id, request) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound();
    }

    internal static async Task<IResult> GetAssetsHandler([FromRoute] Guid id, [FromServices] IEpisodeService episodeService)
        => Results.Ok(await episodeService.GetAssetsAsync(id));

    internal static async Task<IResult> AddAssetHandler(HttpContext context, [FromRoute] Guid id, [FromBody] AddEpisodeAssetRequest request, [FromServices] IEpisodeService episodeService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var data = new AddEpisodeAssetData {
            Id = request.Id,
            Position = request.Position,
        };
        var added = await episodeService.AddAssetAsync(userId, id, data);
        return added ? Results.NoContent() : Results.BadRequest();
    }

    internal static async Task<IResult> UpdateAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] UpdateEpisodeAssetRequest request, [FromServices] IEpisodeService episodeService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var data = new UpdateEpisodeAssetData {
            Position = request.Position,
        };
        var updated = await episodeService.UpdateAssetAsync(userId, id, assetId, data);
        return updated ? Results.NoContent() : Results.BadRequest();
    }

    internal static async Task<IResult> RemoveAssetHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromServices] IEpisodeService episodeService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var removed = await episodeService.RemoveAssetAsync(userId, id, assetId);
        return removed ? Results.NoContent() : Results.NotFound();
    }
}