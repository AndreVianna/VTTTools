namespace VttTools.AI.Services;

public class PromptEnhancementService(IAiProviderFactory providerFactory)
    : IPromptEnhancementService {

    public async Task<Result<PromptEnhancementResponse>> EnhanceAsync(
        PromptEnhancementData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<PromptEnhancementResponse>(null!, validation.Errors);

        var provider = providerFactory.GetPromptProvider(data.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.EnhanceAsync(data, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure<PromptEnhancementResponse>(null!, result.Errors[0].Message)
            : (Result<PromptEnhancementResponse>)new PromptEnhancementResponse {
                EnhancedPrompt = result.Value,
                Provider = provider.ProviderType,
                Model = data.Model,
                TokensUsed = 0,
                Cost = 0m,
                Duration = stopwatch.Elapsed,
            };
    }
}
