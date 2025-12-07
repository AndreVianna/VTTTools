namespace VttTools.AI.Providers;

public interface IPromptProvider {
    AiProviderType ProviderType { get; }
    Task<Result<string>> EnhanceAsync(PromptEnhancementRequest request, CancellationToken ct = default);
}
