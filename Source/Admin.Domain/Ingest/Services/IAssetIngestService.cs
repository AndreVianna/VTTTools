namespace VttTools.Admin.Ingest.Services;

public interface IAssetIngestService {
    Task<Result<IngestJobResponse>> IngestAssetsAsync(IngestAssetsRequest request, CancellationToken ct = default);
    Task<Result<IngestBatchResponse>> ApproveAssetsAsync(ApproveAssetsRequest request, CancellationToken ct = default);
    Task<Result<IngestJobResponse>> RejectAssetsAsync(RejectAssetsRequest request, CancellationToken ct = default);
    Task<Result<IngestBatchResponse>> DiscardAssetsAsync(DiscardAssetsRequest request, CancellationToken ct = default);
    Task<Result<IngestJobResponse>> RetryFailedAsync(RetryFailedRequest request, CancellationToken ct = default);
    Task<IngestAssetListResponse> GetProcessingAssetsAsync(int skip, int take, CancellationToken ct = default);
    Task<IngestAssetListResponse> GetReviewAssetsAsync(int skip, int take, CancellationToken ct = default);
    Task<IngestAssetListResponse> GetHistoryAssetsAsync(int skip, int take, CancellationToken ct = default);
}
