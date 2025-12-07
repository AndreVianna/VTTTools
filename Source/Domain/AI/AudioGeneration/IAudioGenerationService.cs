namespace VttTools.AI.AudioGeneration;

public interface IAudioGenerationService {
    Task<Result<AudioGenerationResponse>> GenerateAsync(
        AudioGenerationRequest request,
        CancellationToken ct = default);

    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
