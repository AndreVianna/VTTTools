namespace VttTools.AI.UnitTests.Mocks;

public class MockPromptProvider : IPromptProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.OpenAi;
    public string EnhancedPromptToReturn { get; set; } = "Enhanced prompt";
    public string? ErrorToReturn { get; set; }
    public PromptEnhancementRequest? LastRequest { get; private set; }

    public Task<Result<string>> EnhanceAsync(PromptEnhancementRequest request, CancellationToken ct = default) {
        LastRequest = request;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<string>(null!, ErrorToReturn)
            : Result.Success(EnhancedPromptToReturn));
    }
}
