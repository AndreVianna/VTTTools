namespace VttTools.Library.EndpointMappers;

internal static class BarrierEndpointsMapper {
    public static void MapBarrierEndpoints(this IEndpointRouteBuilder app) {
        var barriers = app.MapGroup("/api/library/barriers").RequireAuthorization();

        barriers.MapPost("", BarrierHandlers.CreateBarrierHandler);
        barriers.MapGet("", BarrierHandlers.GetBarriersHandler);
        barriers.MapGet("/{id:guid}", BarrierHandlers.GetBarrierByIdHandler);
        barriers.MapPut("/{id:guid}", BarrierHandlers.UpdateBarrierHandler);
        barriers.MapDelete("/{id:guid}", BarrierHandlers.DeleteBarrierHandler);

        var sceneBarriers = app.MapGroup("/api/scenes/{sceneId:guid}/barriers").RequireAuthorization();
        sceneBarriers.MapPost("", BarrierHandlers.PlaceSceneBarrierHandler);
        sceneBarriers.MapPatch("/{id:guid}", BarrierHandlers.UpdateSceneBarrierHandler);
        sceneBarriers.MapDelete("/{id:guid}", BarrierHandlers.RemoveSceneBarrierHandler);
    }
}
