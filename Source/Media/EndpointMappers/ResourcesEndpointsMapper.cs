namespace VttTools.Media.EndpointMappers;

internal static class ResourcesEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Asset templates CRUD operations.
    /// </summary>
    public static void MapResourcesEndpoints(this IEndpointRouteBuilder app) {
        var assets = app.MapGroup("/api/resources").RequireAuthorization();
        assets.MapPost("/{type}/{id:Guid}", ResourcesHandlers.UploadFileHandler);
    }
}