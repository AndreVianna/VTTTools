namespace VttTools.AI.UnitTests.Mocks;

public class MockAudioProvider : IAudioProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.OpenAi;
    public byte[] AudioDataToReturn { get; set; } = [0x52, 0x49, 0x46, 0x46];
    public string? ErrorToReturn { get; set; }
    public AudioGenerationRequest? LastRequest { get; private set; }

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationRequest request, CancellationToken ct = default) {
        LastRequest = request;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<byte[]>(null!, ErrorToReturn)
            : Result.Success(AudioDataToReturn));
    }
}
