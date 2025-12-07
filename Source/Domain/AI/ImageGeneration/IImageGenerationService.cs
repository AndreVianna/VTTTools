namespace VttTools.AI.ImageGeneration;

public interface IImageGenerationService {
    Task<Result<ImageGenerationResponse>> GenerateAsync(
        ImageGenerationRequest request,
        CancellationToken ct = default);

    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
