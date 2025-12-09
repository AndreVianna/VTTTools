namespace VttTools.AI.Providers.Suno;

public sealed class SunoAudioProvider : IAudioProvider {
    public AiProviderType ProviderType => AiProviderType.Suno;

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationRequest request, CancellationToken ct = default)
        => throw new NotImplementedException("Suno audio generation provider is not yet implemented.");
}
