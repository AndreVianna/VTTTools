namespace VttTools.Library.EndpointMappers;

internal static class ContentEndpointsMapper {
    public static void MapContentEndpoints(this IEndpointRouteBuilder app) {
        var content = app.MapGroup("/api/library").RequireAuthorization();

        content.MapGet("/", ContentHandlers.GetContentHandler);
    }
}