namespace VttTools.Library.EndpointMappers;

internal static class AdventureEndpointsMapper {
    public static void MapAdventureEndpoints(this IEndpointRouteBuilder app) {
        var adventures = app.MapGroup("/api/adventures").RequireAuthorization();

        adventures.MapGet("/", AdventureHandlers.GetAdventuresHandler);
        adventures.MapPost("/", AdventureHandlers.CreateAdventureHandler);
        adventures.MapPost("/{id:guid}/clone", AdventureHandlers.CloneAdventureHandler);
        adventures.MapGet("/{id:guid}", AdventureHandlers.GetAdventureByIdHandler);
        adventures.MapPatch("/{id:guid}", AdventureHandlers.UpdateAdventureHandler);
        adventures.MapDelete("/{id:guid}", AdventureHandlers.DeleteAdventureHandler);
        adventures.MapGet("/{id:guid}/encounters", AdventureHandlers.GetEncountersHandler);
        adventures.MapPost("/{id:guid}/encounters", AdventureHandlers.AddNewEncounterHandler);
        adventures.MapPost("/{id:guid}/encounters/{encounterId:guid}/clone", AdventureHandlers.AddClonedEncounterHandler);
    }
}