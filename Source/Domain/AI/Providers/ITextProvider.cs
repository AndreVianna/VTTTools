namespace VttTools.AI.Providers;

public interface ITextProvider {
    AiProviderType ProviderType { get; }
    Task<Result<TextGenerationResponse>> GenerateAsync(TextGenerationData data, CancellationToken ct = default);
}
