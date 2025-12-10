namespace VttTools.AI.UnitTests.Mocks;

public class MockAudioProvider : IAudioProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.OpenAi;
    public byte[] AudioDataToReturn { get; set; } = [0x52, 0x49, 0x46, 0x46];
    public string? ErrorToReturn { get; set; }
    public AudioGenerationData? LastRequest { get; private set; }

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationData data, CancellationToken ct = default) {
        LastRequest = data;
        return Task.FromResult(ErrorToReturn != null
            ? Result.Failure<byte[]>(null!, ErrorToReturn)
            : Result.Success(AudioDataToReturn));
    }
}
