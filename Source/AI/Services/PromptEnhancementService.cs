namespace VttTools.AI.Services;

public class PromptEnhancementService(
    IAiProviderFactory providerFactory)
    : IPromptEnhancementService {

    public async Task<Result<PromptEnhancementResponse>> EnhanceAsync(
        PromptEnhancementRequest request,
        CancellationToken ct = default) {
        var provider = providerFactory.GetPromptProvider(request.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.EnhanceAsync(request, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure<PromptEnhancementResponse>(null!, result.Errors[0].Message)
            : (Result<PromptEnhancementResponse>)new PromptEnhancementResponse {
                EnhancedPrompt = result.Value,
                Provider = provider.ProviderType,
                Model = request.Model,
                TokensUsed = 0,
                Cost = 0m,
                Duration = stopwatch.Elapsed,
            };
    }
}
