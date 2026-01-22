namespace VttTools.Admin.Resources.Clients;

public interface IAiServiceClient {
    Task<Result<byte[]>> GenerateImageAsync(ImageGenerationRequest request, CancellationToken ct = default);
    Task<Job?> StartBulkGenerationAsync(Guid ownerId, BulkAssetGenerationRequest request, CancellationToken ct = default);
}