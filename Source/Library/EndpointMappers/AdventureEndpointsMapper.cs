namespace VttTools.Library.EndpointMappers;

internal static class AdventureEndpointsMapper {
    public static void MapAdventureEndpoints(this IEndpointRouteBuilder app) {
        var adventures = app.MapGroup("/api/adventures").RequireAuthorization();

        adventures.MapGet("/", AdventureHandlers.GetAdventuresHandler);
        adventures.MapPost("/", AdventureHandlers.CreateAdventureHandler);
        adventures.MapPost("/clone/{id:guid}", AdventureHandlers.CloneAdventureHandler);
        adventures.MapGet("/{id:guid}", AdventureHandlers.GetAdventureByIdHandler);
        adventures.MapPatch("/{id:guid}", AdventureHandlers.UpdateAdventureHandler);
        adventures.MapDelete("/{id:guid}", AdventureHandlers.DeleteAdventureHandler);
        adventures.MapGet("/{id:guid}/scenes", AdventureHandlers.GetScenesHandler);
        adventures.MapPost("/{id:guid}/scenes", AdventureHandlers.AddNewSceneHandler);
        adventures.MapPost("/{id:guid}/scenes/clone/{sceneId:guid}", AdventureHandlers.AddClonedSceneHandler);
    }
}