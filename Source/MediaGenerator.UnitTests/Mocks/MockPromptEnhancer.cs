using Request = (string imageType, VttTools.Assets.Model.Asset entity, int tokenIndex);

namespace VttTools.AssetImageManager.Mocks;

public sealed class MockPromptEnhancer : IPromptEnhancer {
    private readonly Queue<PromptEnhancerResponse> _responses = new();
    private readonly List<Request> _receivedRequests = [];

    public IReadOnlyList<Request> ReceivedRequests => _receivedRequests;

    public void EnqueueResponse(PromptEnhancerResponse response) => _responses.Enqueue(response);

    public void EnqueueSuccess(string prompt)
        => _responses.Enqueue(new(
                                  Prompt: prompt,
                                  IsSuccess: true,
                                  ErrorMessage: null,
                                  TotalTokens: 100));

    public void EnqueueFailure(string errorMessage)
        => _responses.Enqueue(new(
                                  Prompt: string.Empty,
                                  IsSuccess: false,
                                  ErrorMessage: errorMessage,
                                  TotalTokens: 0));

    public Task<PromptEnhancerResponse> EnhancePromptAsync(
        string imageType,
        Asset entity,
        int tokenIndex = 0,
        CancellationToken ct = default) {

        _receivedRequests.Add((imageType, entity, tokenIndex));

        return _responses.Count == 0
            ? Task.FromResult(new PromptEnhancerResponse(
                Prompt: $"Enhanced: {entity.Name}",
                IsSuccess: true,
                ErrorMessage: null,
                TotalTokens: 100))
            : Task.FromResult(_responses.Dequeue());
    }

    public void Reset() {
        _responses.Clear();
        _receivedRequests.Clear();
    }
}