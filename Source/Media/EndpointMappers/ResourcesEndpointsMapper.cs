namespace VttTools.Media.EndpointMappers;

internal static class ResourcesEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Asset templates CRUD operations.
    /// </summary>
    public static void MapResourcesEndpoints(this IEndpointRouteBuilder app) {
        var assets = app.MapGroup("/api/resource").RequireAuthorization();
        assets.MapPost("/{type}/{id:Guid}/{resource}", ResourcesHandlers.UploadFileHandler);
        assets.MapGet("/{type}/{id:Guid}/{resource}", ResourcesHandlers.DownloadFileHandler);
        assets.MapDelete("/{type}/{id:Guid}/{resource}", ResourcesHandlers.EraseFileHandler);
    }
}