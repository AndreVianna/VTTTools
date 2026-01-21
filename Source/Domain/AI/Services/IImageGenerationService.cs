namespace VttTools.AI.Services;

public interface IImageGenerationService
    : IGenerationService<ImageGenerationData, ImageGenerationResponse> {
    Task<Result<Job>> GenerateManyAsync(Guid ownerId, GenerateManyAssetsData data, CancellationToken ct = default);
}