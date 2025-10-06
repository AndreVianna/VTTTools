namespace VttTools.Media.EndpointMappers;

public static class ResourcesEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Asset templates CRUD operations.
    /// </summary>
    public static void MapResourcesEndpoints(this IEndpointRouteBuilder app) {
        var resources = app.MapGroup("/api/resources");

        // Upload and delete require authorization
        resources.MapPost("/", ResourcesHandlers.UploadFileHandler)
            .RequireAuthorization()
            .DisableAntiforgery();  // API endpoint - no CSRF needed
        resources.MapDelete("/{id:Guid}", ResourcesHandlers.DeleteFileHandler)
            .RequireAuthorization();

        // Download is public (resources are GUID-identified, access control is at Asset level)
        resources.MapGet("/{id:Guid}", ResourcesHandlers.DownloadFileHandler)
            .AllowAnonymous();
    }
}