namespace VttTools.GameService.Endpoints;

internal static class AdventureEndpointsMapper {
    public static void MapAdventureEndpoints(this IEndpointRouteBuilder app) {
        var adventures = app.MapGroup("/api/adventures").RequireAuthorization();

        adventures.MapGet("/", AdventureHandlers.GetAdventuresHandler);
        adventures.MapGet("/{id:guid}", AdventureHandlers.GetAdventureByIdHandler);
        adventures.MapPost("/", AdventureHandlers.CreateAdventureHandler);
        adventures.MapPatch("/{id:guid}", AdventureHandlers.UpdateAdventureHandler);
        adventures.MapDelete("/{id:guid}", AdventureHandlers.DeleteAdventureHandler);
        adventures.MapPost("/{id:guid}/clone", AdventureHandlers.CloneAdventureHandler);
        adventures.MapGet("/{id:guid}/episodes", AdventureHandlers.GetEpisodesHandler);
        adventures.MapPost("/{id:guid}/episodes/{episodeId:guid}", AdventureHandlers.AddEpisodeHandler);
        adventures.MapDelete("/{id:guid}/episodes/{episodeId:guid}", AdventureHandlers.RemoveEpisodeHandler);
    }
}