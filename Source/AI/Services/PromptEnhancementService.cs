namespace VttTools.AI.Services;

public class PromptEnhancementService(IAiProviderFactory providerFactory)
    : IPromptEnhancementService {

    public async Task<Result<PromptEnhancementResponse>> GenerateAsync(
        PromptEnhancementData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<PromptEnhancementResponse>(null!, validation.Errors);

        var resolvedData = ResolveProviderAndModel(data);
        var provider = providerFactory.GetPromptProvider(resolvedData.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(resolvedData, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure(result.Errors).WithNo<PromptEnhancementResponse>()
            : new PromptEnhancementResponse {
                EnhancedPrompt = result.Value,
                InputTokens = 0,
                OutputTokens = 0,
                Cost = 0m,
                Elapsed = stopwatch.Elapsed,
            };
    }

    public IReadOnlyList<string> GetAvailableProviders()
        => providerFactory.GetAvailablePromptProviders();

    private PromptEnhancementData ResolveProviderAndModel(PromptEnhancementData data) {
        if (!string.IsNullOrEmpty(data.Provider) && !string.IsNullOrEmpty(data.Model))
            return data;

        (var provider, var model) = providerFactory.GetProviderAndModel(GeneratedContentType.PromptEnhancement);
        return data with {
            Provider = data.Provider ?? provider,
            Model = data.Model ?? model,
        };
    }
}