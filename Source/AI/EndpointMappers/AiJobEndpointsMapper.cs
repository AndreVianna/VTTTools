namespace VttTools.AI.EndpointMappers;

public static class AiJobEndpointsMapper {
    public static void MapAiJobEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/ai")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .RequireRateLimiting("write");

        MapBulkGenerationEndpoints(group);
    }

    private static void MapBulkGenerationEndpoints(RouteGroupBuilder group) {
        var bulkGroup = group.MapGroup("/bulk-generation");

        bulkGroup.MapPost("/", AiJobHandlers.StartBulkGenerationHandler)
            .WithName("StartBulkGeneration");
    }
}
