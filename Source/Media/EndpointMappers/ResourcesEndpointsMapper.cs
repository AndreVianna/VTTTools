namespace VttTools.Media.EndpointMappers;

public static class ResourcesEndpointsMapper {
    public static void MapResourcesEndpoints(this IEndpointRouteBuilder app) {
        var resources = app.MapGroup("/api/resources");

        resources.MapGet("/", ResourcesHandlers.FilterResourcesHandler)
            .RequireAuthorization();
        resources.MapPost("/", ResourcesHandlers.UploadResourceHandler)
            .RequireAuthorization()
            .DisableAntiforgery();
        resources.MapDelete("/{id:Guid}", ResourcesHandlers.DeleteResourceHandler)
            .RequireAuthorization();
        resources.MapGet("/{id:Guid}", ResourcesHandlers.ServeResourceHandler);
        resources.MapGet("/{id:Guid}/thumbnail", ResourcesHandlers.ServeThumbnailHandler);
        resources.MapGet("/{id:Guid}/info", ResourcesHandlers.GetResourceInfoHandler);
        resources.MapPut("/{id:Guid}", ResourcesHandlers.UpdateResourceHandler)
            .RequireAuthorization();
    }
}