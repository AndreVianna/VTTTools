using VttTools.MediaGenerator.Domain.Images.Models;

namespace VttTools.AssetImageManager.Mocks;

public sealed class MockImageGenerator : IImageGenerator {
    private readonly Queue<byte[]> _images = new();
    private readonly List<(string Prompt, string ImageType, string? NegativePrompt)> _receivedRequests = [];

    public IReadOnlyList<(string Prompt, string ImageType, string? NegativePrompt)> ReceivedRequests => _receivedRequests;

    public void EnqueueImage(byte[] imageBytes) => _images.Enqueue(imageBytes);

    public void EnqueueFakeImage(int sizeBytes = 1024) {
        var fakeImage = new byte[sizeBytes];
        for (var i = 0; i < sizeBytes; i++) {
            fakeImage[i] = (byte)(i % 256);
        }
        _images.Enqueue(fakeImage);
    }

    public Task<GenerateImageResponse> GenerateImageFileAsync(string model, string imageType, string? prompt = null, CancellationToken ct = default) {
        _receivedRequests.Add((model, imageType, prompt));

        if (_images.Count == 0) {
            EnqueueFakeImage();
        }

        var result = new GenerateImageResponse(_images.Dequeue(), true);
        return Task.FromResult(result);
    }

    public void Reset() {
        _images.Clear();
        _receivedRequests.Clear();
    }
}