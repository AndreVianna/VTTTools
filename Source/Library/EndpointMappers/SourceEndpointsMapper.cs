namespace VttTools.Library.EndpointMappers;

internal static class SourceEndpointsMapper {
    public static void MapSourceEndpoints(this IEndpointRouteBuilder app) {
        var sources = app.MapGroup("/api/library/sources").RequireAuthorization();

        sources.MapPost("", SourceHandlers.CreateSourceHandler);
        sources.MapGet("", SourceHandlers.GetSourcesHandler);
        sources.MapGet("/{id:guid}", SourceHandlers.GetSourceByIdHandler);
        sources.MapPut("/{id:guid}", SourceHandlers.UpdateSourceHandler);
        sources.MapDelete("/{id:guid}", SourceHandlers.DeleteSourceHandler);

        var sceneSources = app.MapGroup("/api/scenes/{sceneId:guid}/sources").RequireAuthorization();
        sceneSources.MapPost("", SourceHandlers.PlaceSceneSourceHandler);
        sceneSources.MapPatch("/{id:guid}", SourceHandlers.UpdateSceneSourceHandler);
        sceneSources.MapDelete("/{id:guid}", SourceHandlers.RemoveSceneSourceHandler);
    }
}
