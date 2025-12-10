namespace VttTools.MediaGenerator.UnitTests.Mocks;

public sealed class MockPromptEnhancementService : IPromptEnhancementService {
    private readonly Queue<Result<PromptEnhancementResponse>> _responses = new();
    private readonly List<PromptEnhancementData> _receivedRequests = [];

    public IReadOnlyList<PromptEnhancementData> ReceivedRequests => _receivedRequests;

    public void EnqueueSuccess(string enhancedPrompt) {
        var response = new PromptEnhancementResponse {
            EnhancedPrompt = enhancedPrompt,
            Provider = AiProviderType.OpenAi,
            TokensUsed = 100,
            Cost = 0.01m,
            Duration = TimeSpan.FromSeconds(1)
        };
        _responses.Enqueue(Result.Success(response));
    }

    public void EnqueueFailure(string errorMessage) => _responses.Enqueue(Result.Failure<PromptEnhancementResponse>(null!, errorMessage));

    public Task<Result<PromptEnhancementResponse>> EnhanceAsync(
        PromptEnhancementData data,
        CancellationToken ct = default) {
        _receivedRequests.Add(data);

        if (_responses.Count == 0) {
            EnqueueSuccess("Enhanced prompt");
        }

        return Task.FromResult(_responses.Dequeue());
    }

    public void Reset() {
        _responses.Clear();
        _receivedRequests.Clear();
    }
}
