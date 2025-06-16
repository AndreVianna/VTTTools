namespace VttTools.Library.EndpointMappers;

internal static class SceneEndpointsMapper {
    public static void MapSceneEndpoints(this IEndpointRouteBuilder app) {
        var scenes = app.MapGroup("/api/scenes")
                          .RequireAuthorization();

        scenes.MapGet("/{id:guid}", SceneHandlers.GetSceneByIdHandler);
        scenes.MapPatch("/{id:guid}", SceneHandlers.UpdateSceneHandler);
        scenes.MapDelete("/{id:guid}", SceneHandlers.DeleteSceneHandler);
        scenes.MapGet("/{id:guid}/assets", SceneHandlers.GetAssetsHandler);
        scenes.MapPost("/{id:guid}/assets/{assetId:guid}", SceneHandlers.AddAssetHandler);
        scenes.MapPost("/{id:guid}/assets/{number:int}", SceneHandlers.CloneAssetHandler);
        scenes.MapPatch("/{id:guid}/assets/{number:int}", SceneHandlers.UpdateAssetHandler);
        scenes.MapDelete("/{id:guid}/assets/{number:int}", SceneHandlers.RemoveAssetHandler);
    }
}