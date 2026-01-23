using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using VttTools.Media.Ingest.Handlers;

namespace VttTools.Media.Ingest.EndpointMappers;

/// <summary>
/// Endpoint mapper for ingest operations.
/// </summary>
public static class IngestEndpointsMapper {
    /// <summary>
    /// Map ingest endpoints.
    /// </summary>
    public static void MapIngestEndpoints(this IEndpointRouteBuilder app) {
        var ingest = app.MapGroup("/api/resources/ingest");

        ingest.MapPost("", IngestHandlers.StartIngestHandler)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithName("StartIngest")
            .WithSummary("Start an ingest job to generate AI images for assets");
    }
}
