namespace VttTools.Library.EndpointMappers;

internal static class SceneEndpointsMapper {
    public static void MapSceneEndpoints(this IEndpointRouteBuilder app) {
        var scenes = app.MapGroup("/api/scenes").RequireAuthorization();

        scenes.MapGet("/{id:guid}", SceneHandlers.GetSceneByIdHandler);
        scenes.MapPatch("/{id:guid}", SceneHandlers.UpdateSceneHandler);
        scenes.MapDelete("/{id:guid}", SceneHandlers.DeleteSceneHandler);
        scenes.MapGet("/{id:guid}/assets", SceneHandlers.GetAssetsHandler);
        scenes.MapPatch("/{id:guid}/assets", SceneHandlers.BulkUpdateAssetsHandler);
        scenes.MapPost("/{id:guid}/assets/clone", SceneHandlers.BulkCloneAssetsHandler);
        scenes.MapDelete("/{id:guid}/assets", SceneHandlers.BulkDeleteAssetsHandler);
        scenes.MapPost("/{id:guid}/assets", SceneHandlers.BulkAddAssetsHandler);
        scenes.MapPost("/{id:guid}/assets/{assetId:guid}", SceneHandlers.AddAssetHandler);
        scenes.MapPost("/{id:guid}/assets/{index:int}/clone", SceneHandlers.CloneAssetHandler);
        scenes.MapPatch("/{id:guid}/assets/{index:int}", SceneHandlers.UpdateAssetHandler);
        scenes.MapDelete("/{id:guid}/assets/{index:int}", SceneHandlers.RemoveAssetHandler);
    }
}