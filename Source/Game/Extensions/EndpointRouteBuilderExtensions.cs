namespace VttTools.Game.Extensions;

internal static class EndpointRouteBuilderExtensions {
    internal static void MapApplicationEndpoints(this IEndpointRouteBuilder app) {
        app.MapOpenApi();
        app.MapHealthCheckEndpoints();
        app.MapGameSessionEndpoints();
    }
}