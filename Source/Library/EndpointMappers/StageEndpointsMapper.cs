namespace VttTools.Library.EndpointMappers;

internal static class StageEndpointsMapper {
    public static void MapStageEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/stages").RequireAuthorization();

        // Stage CRUD
        group.MapGet("/", StageHandlers.GetStagesHandler);
        group.MapGet("/{id:guid}", StageHandlers.GetStageByIdHandler);
        group.MapPost("/", StageHandlers.CreateStageHandler);
        group.MapPatch("/{id:guid}", StageHandlers.UpdateStageHandler);
        group.MapDelete("/{id:guid}", StageHandlers.DeleteStageHandler);
        group.MapPost("/{id:guid}/clone", StageHandlers.CloneStageHandler);

        // === Structural Elements ===

        // Walls
        group.MapPost("/{id:guid}/walls", StageHandlers.AddWallHandler);
        group.MapPatch("/{id:guid}/walls/{index:int}", StageHandlers.UpdateWallHandler);
        group.MapDelete("/{id:guid}/walls/{index:int}", StageHandlers.RemoveWallHandler);

        // Regions
        group.MapPost("/{id:guid}/regions", StageHandlers.AddRegionHandler);
        group.MapPatch("/{id:guid}/regions/{index:int}", StageHandlers.UpdateRegionHandler);
        group.MapDelete("/{id:guid}/regions/{index:int}", StageHandlers.RemoveRegionHandler);

        // Lights
        group.MapPost("/{id:guid}/lights", StageHandlers.AddLightHandler);
        group.MapPatch("/{id:guid}/lights/{index:int}", StageHandlers.UpdateLightHandler);
        group.MapDelete("/{id:guid}/lights/{index:int}", StageHandlers.RemoveLightHandler);

        // Elements
        group.MapPost("/{id:guid}/elements", StageHandlers.AddDecorationHandler);
        group.MapPatch("/{id:guid}/elements/{index:int}", StageHandlers.UpdateDecorationHandler);
        group.MapDelete("/{id:guid}/elements/{index:int}", StageHandlers.RemoveDecorationHandler);

        // Sounds
        group.MapPost("/{id:guid}/sounds", StageHandlers.AddSoundHandler);
        group.MapPatch("/{id:guid}/sounds/{index:int}", StageHandlers.UpdateSoundHandler);
        group.MapDelete("/{id:guid}/sounds/{index:int}", StageHandlers.RemoveSoundHandler);
    }
}
