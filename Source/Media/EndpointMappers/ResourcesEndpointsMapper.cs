namespace VttTools.Media.EndpointMappers;

public static class ResourcesEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Asset templates CRUD operations.
    /// </summary>
    public static void MapResourcesEndpoints(this IEndpointRouteBuilder app) {
        var assets = app.MapGroup("/api/resources").RequireAuthorization();
        assets.MapPost("/", ResourcesHandlers.UploadFileHandler);
        assets.MapGet("/{id:Guid}", ResourcesHandlers.DownloadFileHandler);
        assets.MapDelete("/{id:Guid}", ResourcesHandlers.DeleteFileHandler);
    }
}