namespace VttTools.GameService.Endpoints;

internal static class EpisodeEndpointsMapper {
    public static void MapEpisodeEndpoints(this IEndpointRouteBuilder app) {
        var episodes = app.MapGroup("/api/episodes")
                          .RequireAuthorization();

        episodes.MapGet("/{id:guid}", EpisodeHandlers.GetEpisodeByIdHandler);
        episodes.MapPatch("/{id:guid}", EpisodeHandlers.UpdateEpisodeHandler);
        episodes.MapGet("/{id:guid}/assets", EpisodeHandlers.GetAssetsHandler);
        episodes.MapPost("/{id:guid}/assets", EpisodeHandlers.AddAssetHandler);
        episodes.MapDelete("/{id:guid}/assets/{assetId:guid}", EpisodeHandlers.RemoveAssetHandler);
    }
}