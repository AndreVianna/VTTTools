namespace VttTools.Library.EndpointMappers;

internal static class RegionEndpointsMapper {
    public static void MapRegionEndpoints(this IEndpointRouteBuilder app) {
        var regions = app.MapGroup("/api/library/regions").RequireAuthorization();

        regions.MapPost("", RegionHandlers.CreateRegionHandler);
        regions.MapGet("", RegionHandlers.GetRegionsHandler);
        regions.MapGet("/{id:guid}", RegionHandlers.GetRegionByIdHandler);
        regions.MapPut("/{id:guid}", RegionHandlers.UpdateRegionHandler);
        regions.MapDelete("/{id:guid}", RegionHandlers.DeleteRegionHandler);

        var sceneRegions = app.MapGroup("/api/scenes/{sceneId:guid}/regions").RequireAuthorization();
        sceneRegions.MapPost("", RegionHandlers.PlaceSceneRegionHandler);
        sceneRegions.MapPatch("/{id:guid}", RegionHandlers.UpdateSceneRegionHandler);
        sceneRegions.MapDelete("/{id:guid}", RegionHandlers.RemoveSceneRegionHandler);
    }
}
