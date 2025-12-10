namespace VttTools.AI.Services;

public interface ITextGenerationService {
    Task<Result<TextGenerationResponse>> GenerateAsync(TextGenerationData data, CancellationToken ct = default);
    Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default);
}
