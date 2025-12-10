namespace VttTools.AI.Providers;

public interface IPromptProvider {
    AiProviderType ProviderType { get; }
    Task<Result<string>> EnhanceAsync(PromptEnhancementData data, CancellationToken ct = default);
}
