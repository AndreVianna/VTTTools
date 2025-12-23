namespace VttTools.AssetImageManager.Mocks;

public sealed class MockImageGenerationService
    : IImageGenerationService {
    private readonly Queue<object> _responses = new();
    public List<string> ReceivedRequests { get; } = [];

    public void EnqueueImage(byte[]? imageData = null) {
        var data = imageData ?? [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        var response = new ImageGenerationResponse {
            ImageData = data,
            ContentType = "image/png",
            OutputTokens = 100,
            Cost = 0.01m,
            Elapsed = TimeSpan.FromSeconds(1),
        };
        _responses.Enqueue(Result.Success(response));
    }

    public void EnqueueJob() {
        var response = new Job {
            Id = Guid.CreateVersion7(),
        };
        _responses.Enqueue(Result.Success(response));
    }

    public void EnqueueFailure(string errorMessage)
        => _responses.Enqueue(Result.Failure<ImageGenerationResponse>(null!, errorMessage));

    public IReadOnlyList<string> GetAvailableProviders() => ["OpenAi", "Stability"];

    public Task<Result<ImageGenerationResponse>> GenerateAsync(ImageGenerationData data, CancellationToken ct = default) {
        ReceivedRequests.Add(nameof(GenerateAsync));
        if (_responses.Count == 0)
            EnqueueImage();
        return Task.FromResult((Result<ImageGenerationResponse>)_responses.Dequeue());
    }

    public Task<Result<Job>> GenerateManyAsync(Guid ownerId, GenerateManyAssetsData data, CancellationToken ct = default) {
        ReceivedRequests.Add(nameof(GenerateManyAsync));
        if (_responses.Count == 0)
            EnqueueJob();
        return Task.FromResult((Result<Job>)_responses.Dequeue());
    }

    public void Reset() {
        _responses.Clear();
        ReceivedRequests.Clear();
    }
}
