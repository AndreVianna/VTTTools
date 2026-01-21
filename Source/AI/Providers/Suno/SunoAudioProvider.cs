namespace VttTools.AI.Providers.Suno;

public sealed class SunoAudioProvider : IAudioProvider {
    public string Name => "Suno";

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationData data, CancellationToken ct = default)
        => throw new NotImplementedException("Suno audio generation provider is not yet implemented.");
}