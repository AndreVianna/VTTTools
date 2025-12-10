namespace VttTools.AI.Services;

public interface IImageGenerationService {
    Task<Result<ImageGenerationResponse>> GenerateAsync(ImageGenerationData data, CancellationToken ct = default);
    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
