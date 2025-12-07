namespace VttTools.AI.VideoGeneration;

public interface IVideoGenerationService {
    Task<Result<VideoGenerationResponse>> GenerateAsync(
        VideoGenerationRequest request,
        CancellationToken ct = default);

    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
