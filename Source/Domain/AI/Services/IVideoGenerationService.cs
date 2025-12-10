namespace VttTools.AI.Services;

public interface IVideoGenerationService {
    Task<Result<VideoGenerationResponse>> GenerateAsync(VideoGenerationData data, CancellationToken ct = default);
    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
