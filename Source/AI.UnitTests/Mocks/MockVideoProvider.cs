namespace VttTools.AI.UnitTests.Mocks;

public class MockVideoProvider : IVideoProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.RunwayML;
    public byte[] VideoDataToReturn { get; set; } = [0x00, 0x00, 0x00, 0x18];
    public string? ErrorToReturn { get; set; }
    public VideoGenerationRequest? LastRequest { get; private set; }

    public Task<Result<byte[]>> GenerateAsync(VideoGenerationRequest request, CancellationToken ct = default) {
        LastRequest = request;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<byte[]>(null!, ErrorToReturn)
            : Result.Success(VideoDataToReturn));
    }
}
