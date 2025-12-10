namespace VttTools.AI.Services;

public interface IAudioGenerationService {
    Task<Result<AudioGenerationResponse>> GenerateAsync(AudioGenerationData data, CancellationToken ct = default);
    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
