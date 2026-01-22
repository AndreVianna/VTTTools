using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Ingest.Handlers;

public static class AssetIngestHandlers {
    public static async Task<IResult> IngestAssetsHandler(
        [FromBody] IngestAssetsRequest request,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.IngestAssetsAsync(request, ct);
            return result.IsSuccessful
                ? Results.Created($"/api/admin/ingest/jobs/{result.Value.JobId}", result.Value)
                : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in IngestAssetsHandler");
            return Results.Problem("An unexpected error occurred while ingesting assets");
        }
    }

    public static async Task<IResult> ApproveAssetsHandler(
        [FromBody] ApproveAssetsRequest request,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.ApproveAssetsAsync(request, ct);
            return result.IsSuccessful
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in ApproveAssetsHandler");
            return Results.Problem("An unexpected error occurred while approving assets");
        }
    }

    public static async Task<IResult> RejectAssetsHandler(
        [FromBody] RejectAssetsRequest request,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.RejectAssetsAsync(request, ct);
            return result.IsSuccessful
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in RejectAssetsHandler");
            return Results.Problem("An unexpected error occurred while rejecting assets");
        }
    }

    public static async Task<IResult> DiscardAssetsHandler(
        [FromBody] DiscardAssetsRequest request,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.DiscardAssetsAsync(request, ct);
            return result.IsSuccessful
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in DiscardAssetsHandler");
            return Results.Problem("An unexpected error occurred while discarding assets");
        }
    }

    public static async Task<IResult> RetryFailedHandler(
        [FromBody] RetryFailedRequest request,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.RetryFailedAsync(request, ct);
            return result.IsSuccessful
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in RetryFailedHandler");
            return Results.Problem("An unexpected error occurred while retrying failed assets");
        }
    }

    public static async Task<IResult> GetProcessingAssetsHandler(
        [FromQuery] int skip,
        [FromQuery] int take,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.GetProcessingAssetsAsync(skip, take, ct);
            return Results.Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in GetProcessingAssetsHandler");
            return Results.Problem("An unexpected error occurred while retrieving processing assets");
        }
    }

    public static async Task<IResult> GetReviewAssetsHandler(
        [FromQuery] int skip,
        [FromQuery] int take,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.GetReviewAssetsAsync(skip, take, ct);
            return Results.Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in GetReviewAssetsHandler");
            return Results.Problem("An unexpected error occurred while retrieving review assets");
        }
    }

    public static async Task<IResult> GetHistoryAssetsHandler(
        [FromQuery] int skip,
        [FromQuery] int take,
        IAssetIngestService service,
        ILogger<AssetIngestService> logger,
        CancellationToken ct) {
        try {
            var result = await service.GetHistoryAssetsAsync(skip, take, ct);
            return Results.Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in GetHistoryAssetsHandler");
            return Results.Problem("An unexpected error occurred while retrieving history assets");
        }
    }
}
