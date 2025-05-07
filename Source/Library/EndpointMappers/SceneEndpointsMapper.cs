namespace VttTools.Library.EndpointMappers;

internal static class SceneEndpointsMapper {
    public static void MapSceneEndpoints(this IEndpointRouteBuilder app) {
        var scenes = app.MapGroup("/api/scenes")
                          .RequireAuthorization();

        scenes.MapGet("/{id:guid}", SceneHandlers.GetSceneByIdHandler);
        scenes.MapPatch("/{id:guid}", SceneHandlers.UpdateSceneHandler);
        scenes.MapGet("/{id:guid}/assets", SceneHandlers.GetAssetsHandler);
        scenes.MapPost("/{id:guid}/assets", SceneHandlers.AddAssetHandler);
        scenes.MapDelete("/{id:guid}/assets/{assetId:guid}", SceneHandlers.RemoveAssetHandler);
    }
}