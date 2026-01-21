namespace VttTools.Library.EndpointMappers;

internal static class EncounterEndpointsMapper {
    public static void MapEncounterEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/encounters").RequireAuthorization();

        group.MapGet("/", EncounterHandlers.GetEncountersHandler);
        group.MapPost("/", EncounterHandlers.CreateEncounterHandler);
        group.MapGet("/{id:guid}", EncounterHandlers.GetEncounterByIdHandler);
        group.MapPatch("/{id:guid}", EncounterHandlers.UpdateEncounterHandler);
        group.MapDelete("/{id:guid}", EncounterHandlers.DeleteEncounterHandler);

        group.MapGet("/{id:guid}/actors", EncounterHandlers.GetActorsHandler);
        group.MapPost("/{id:guid}/actors/{assetId:guid}", EncounterHandlers.AddActorHandler);
        group.MapPatch("/{id:guid}/actors/{index:int}", EncounterHandlers.UpdateActorHandler);
        group.MapDelete("/{id:guid}/actors/{index:int}", EncounterHandlers.RemoveActorHandler);

        group.MapGet("/{id:guid}/objects", EncounterHandlers.GetObjectsHandler);
        group.MapPost("/{id:guid}/objects/{assetId:guid}", EncounterHandlers.AddObjectHandler);
        group.MapPatch("/{id:guid}/objects/{index:int}", EncounterHandlers.UpdateObjectHandler);
        group.MapDelete("/{id:guid}/objects/{index:int}", EncounterHandlers.RemoveObjectHandler);

        group.MapGet("/{id:guid}/effects", EncounterHandlers.GetEffectsHandler);
        group.MapPost("/{id:guid}/effects/{assetId:guid}", EncounterHandlers.AddEffectHandler);
        group.MapPatch("/{id:guid}/effects/{index:int}", EncounterHandlers.UpdateEffectHandler);
        group.MapDelete("/{id:guid}/effects/{index:int}", EncounterHandlers.RemoveEffectHandler);
    }
}