namespace VttTools.GameService.Endpoints;

internal static class EpisodesEndpointsMapper {
    public static void MapEpisodeEndpoints(this IEndpointRouteBuilder app) {
        var episodes = app.MapGroup("/api/episodes")
                          .RequireAuthorization();

        episodes.MapGet("/{id:guid}", EpisodeHandlers.GetEpisodeByIdHandler);
        episodes.MapPatch("/{id:guid}", EpisodeHandlers.UpdateEpisodeHandler);
        episodes.MapDelete("/{id:guid}", EpisodeHandlers.DeleteEpisodeHandler);
        episodes.MapPost("/{id:guid}/clone", EpisodeHandlers.CloneEpisodeHandler);
        episodes.MapGet("/{id:guid}/assets", EpisodeHandlers.GetAssetsHandler);
        episodes.MapPost("/{id:guid}/assets/{assetId:guid}", EpisodeHandlers.AddAssetHandler);
        episodes.MapDelete("/{id:guid}/assets/{assetId:guid}", EpisodeHandlers.RemoveAssetHandler);
    }
}