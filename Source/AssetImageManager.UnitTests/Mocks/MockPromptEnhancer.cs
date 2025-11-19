using Request = (VttTools.AssetImageManager.Domain.Tokens.ServiceContracts.EntityDefinition entity, VttTools.AssetImageManager.Domain.Tokens.Models.StructuralVariant variant);

namespace VttTools.AssetImageManager.UnitTests.Mocks;

public sealed class MockPromptEnhancer : IPromptEnhancer {
    private readonly Queue<PromptEnhancerResponse> _responses = new();
    private readonly List<Request> _receivedRequests = [];

    public IReadOnlyList<Request> ReceivedRequests => _receivedRequests;

    public void EnqueueResponse(PromptEnhancerResponse response) => _responses.Enqueue(response);

    public void EnqueueSuccess(string prompt)
        => _responses.Enqueue(new PromptEnhancerResponse(
            Prompt: prompt,
            IsSuccess: true,
            ErrorMessage: null,
            TotalTokens: 100));

    public void EnqueueFailure(string errorMessage)
        => _responses.Enqueue(new PromptEnhancerResponse(
            Prompt: string.Empty,
            IsSuccess: false,
            ErrorMessage: errorMessage,
            TotalTokens: 0));

    public Task<PromptEnhancerResponse> EnhancePromptAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        string imageType,
        CancellationToken ct = default) {

        _receivedRequests.Add((entity, variant));

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
