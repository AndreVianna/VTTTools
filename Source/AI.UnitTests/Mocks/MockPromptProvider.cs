namespace VttTools.AI.UnitTests.Mocks;

public class MockPromptProvider : IPromptProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.OpenAi;
    public string EnhancedPromptToReturn { get; set; } = "Enhanced prompt";
    public string? ErrorToReturn { get; set; }
    public PromptEnhancementData? LastRequest { get; private set; }

    public Task<Result<string>> EnhanceAsync(PromptEnhancementData data, CancellationToken ct = default) {
        LastRequest = data;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<string>(null!, ErrorToReturn)
            : Result.Success(EnhancedPromptToReturn));
    }
}
