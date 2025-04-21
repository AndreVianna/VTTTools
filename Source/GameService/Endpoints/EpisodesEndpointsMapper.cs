namespace VttTools.GameService.Endpoints;

internal static class EpisodesEndpointsMapper {
    public static void MapEpisodeEndpoints(this IEndpointRouteBuilder app) {
        var episodes = app.MapGroup("/api/episodes")
                          .RequireAuthorization();

        episodes.MapGet("/{id:guid}", EpisodeHandlers.GetEpisodeByIdHandler);
        episodes.MapPatch("/{id:guid}", EpisodeHandlers.UpdateEpisodeHandler);
        episodes.MapDelete("/{id:guid}", EpisodeHandlers.DeleteEpisodeHandler);
        episodes.MapPost("/{id:guid}/clone", EpisodeHandlers.CloneEpisodeHandler);
    }
}