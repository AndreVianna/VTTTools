namespace VttTools.AI.Providers.ElevenLabs;

public sealed class ElevenLabsAudioProvider : IAudioProvider {
    public AiProviderType ProviderType => AiProviderType.ElevenLabs;

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationData data, CancellationToken ct = default)
        => throw new NotImplementedException("ElevenLabs audio generation provider is not yet implemented.");
}
