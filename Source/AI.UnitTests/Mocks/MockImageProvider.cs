namespace VttTools.AI.UnitTests.Mocks;

public class MockImageProvider : IImageProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.OpenAi;
    public byte[] ImageDataToReturn { get; set; } = [0x89, 0x50, 0x4E, 0x47];
    public string? ErrorToReturn { get; set; }
    public ImageGenerationData? LastRequest { get; private set; }

    public Task<Result<byte[]>> GenerateAsync(ImageGenerationData data, CancellationToken ct = default) {
        LastRequest = data;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<byte[]>(null!, ErrorToReturn)
            : Result.Success(ImageDataToReturn));
    }
}
