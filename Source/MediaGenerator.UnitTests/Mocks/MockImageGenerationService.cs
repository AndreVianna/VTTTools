using DotNetToolbox.Results;

using VttTools.AI;
using VttTools.AI.ImageGeneration;

namespace VttTools.MediaGenerator.UnitTests.Mocks;

public sealed class MockImageGenerationService : IImageGenerationService {
    private readonly Queue<Result<ImageGenerationResponse>> _responses = new();
    private readonly List<ImageGenerationRequest> _receivedRequests = [];

    public IReadOnlyList<ImageGenerationRequest> ReceivedRequests => _receivedRequests;

    public void EnqueueSuccess(byte[]? imageData = null) {
        var data = imageData ?? [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        var response = new ImageGenerationResponse {
            ImageData = data,
            ContentType = "image/png",
            Provider = AiProviderType.OpenAi,
            TokensUsed = 100,
            Cost = 0.01m,
            Duration = TimeSpan.FromSeconds(1)
        };
        _responses.Enqueue(Result.Success(response));
    }

    public void EnqueueFailure(string errorMessage) => _responses.Enqueue(Result.Failure<ImageGenerationResponse>(null!, errorMessage));

    public Task<Result<ImageGenerationResponse>> GenerateAsync(
        ImageGenerationRequest request,
        CancellationToken ct = default) {
        _receivedRequests.Add(request);

        if (_responses.Count == 0) {
            EnqueueSuccess();
        }

        return Task.FromResult(_responses.Dequeue());
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default) => Task.FromResult<IReadOnlyList<AiProviderType>>([AiProviderType.OpenAi, AiProviderType.Stability]);

    public void Reset() {
        _responses.Clear();
        _receivedRequests.Clear();
    }
}
