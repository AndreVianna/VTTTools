namespace VttTools.GameService.Endpoints;

internal static class AdventureEndpointsMapper {
    public static void MapAdventureEndpoints(this IEndpointRouteBuilder app) {
        var adventures = app.MapGroup("/api/adventures").RequireAuthorization();

        adventures.MapGet("/", AdventureHandlers.GetAdventuresHandler);
        adventures.MapPost("/", AdventureHandlers.CreateAdventureHandler);
        adventures.MapGet("/{id:guid}", AdventureHandlers.GetAdventureByIdHandler);
        adventures.MapPatch("/{id:guid}", AdventureHandlers.UpdateAdventureHandler);
        adventures.MapDelete("/{id:guid}", AdventureHandlers.DeleteAdventureHandler);
        adventures.MapPost("/{id:guid}/clone", AdventureHandlers.CloneAdventureHandler);
        adventures.MapGet("/{id:guid}/episodes", AdventureHandlers.GetEpisodesHandler);
        adventures.MapPost("/{id:guid}/episodes", AdventureHandlers.CreateEpisodeHandler);
        adventures.MapPost("/{id:guid}/episodes/clone", AdventureHandlers.AddClonedEpisodeHandler);
        adventures.MapDelete("/{id:guid}/episodes/{episodeId:guid}", AdventureHandlers.RemoveEpisodeHandler);
    }
}