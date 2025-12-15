namespace VttTools.AI.Services;

public interface IImageGenerationService
    : IGenerationService<ImageGenerationData, ImageGenerationResponse> {
    Task<Result<Job>> GenerateManyAsync(GenerateManyAssetsData data, CancellationToken ct = default);
}
