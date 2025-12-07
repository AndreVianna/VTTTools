namespace VttTools.AI.Providers.Suno;

public sealed class SunoAudioProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<SunoAudioProvider> logger) : IAudioProvider {

    public AiProviderType ProviderType => AiProviderType.Suno;

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationRequest request, CancellationToken ct = default) {
        logger.LogWarning("Suno audio provider is not yet implemented");
        return Task.FromResult(Result.Failure<byte[]>(null!, "Suno audio generation is not yet implemented"));
    }
}
