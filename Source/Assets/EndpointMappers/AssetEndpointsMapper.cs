namespace VttTools.Assets.EndpointMappers;

internal static class AssetEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Asset templates CRUD operations.
    /// </summary>
    public static void MapAssetEndpoints(this IEndpointRouteBuilder app) {
        var assets = app.MapGroup("/api/assets").RequireAuthorization();

        assets.MapGet("/", AssetHandlers.GetAssetsHandler);
        assets.MapGet("/{id:guid}", AssetHandlers.GetAssetByIdHandler);
        assets.MapPost("/", AssetHandlers.CreateAssetHandler);
        assets.MapPatch("/{id:guid}", AssetHandlers.UpdateAssetHandler);
        assets.MapDelete("/{id:guid}", AssetHandlers.DeleteAssetHandler);
        assets.MapPost("/{id:guid}/upload", AssetHandlers.UploadAssetFileHandler);
    }
}