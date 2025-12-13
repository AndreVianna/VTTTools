namespace VttTools.AI.Services;

public class PromptEnhancementService(IAiProviderFactory providerFactory)
    : IPromptEnhancementService {

    public async Task<Result<PromptEnhancementResponse>> GenerateAsync(
        PromptEnhancementData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<PromptEnhancementResponse>(null!, validation.Errors);

        var provider = providerFactory.GetPromptProvider(data.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(data, ct);
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
}
