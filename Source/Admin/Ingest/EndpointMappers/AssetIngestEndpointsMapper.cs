namespace VttTools.Admin.Ingest.EndpointMappers;

public static class AssetIngestEndpointsMapper {
    public static void MapAssetIngestEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/admin/ingest")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .WithTags("Asset Ingest");

        group.MapPost("/", AssetIngestHandlers.IngestAssetsHandler)
            .WithName("IngestAssets")
            .WithDescription("Import assets from JSON and start AI generation");

        group.MapPost("/approve", AssetIngestHandlers.ApproveAssetsHandler)
            .WithName("ApproveAssets")
            .WithDescription("Approve assets and publish them");

        group.MapPost("/reject", AssetIngestHandlers.RejectAssetsHandler)
            .WithName("RejectAssets")
            .WithDescription("Reject assets and regenerate with new prompt");

        group.MapPost("/discard", AssetIngestHandlers.DiscardAssetsHandler)
            .WithName("DiscardAssets")
            .WithDescription("Discard assets and mark them as deleted");

        group.MapPost("/retry", AssetIngestHandlers.RetryFailedHandler)
            .WithName("RetryFailedAssets")
            .WithDescription("Retry failed asset generation");

        group.MapGet("/processing", AssetIngestHandlers.GetProcessingAssetsHandler)
            .WithName("GetProcessingAssets")
            .WithDescription("Get assets in processing states");

        group.MapGet("/review", AssetIngestHandlers.GetReviewAssetsHandler)
            .WithName("GetReviewAssets")
            .WithDescription("Get assets pending review");

        group.MapGet("/history", AssetIngestHandlers.GetHistoryAssetsHandler)
            .WithName("GetHistoryAssets")
            .WithDescription("Get approved and discarded assets");
    }
}
