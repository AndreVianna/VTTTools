namespace VttTools.AI.Providers.ElevenLabs;

public sealed class ElevenLabsAudioProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<ElevenLabsAudioProvider> logger) : IAudioProvider {

    public AiProviderType ProviderType => AiProviderType.ElevenLabs;

    public Task<Result<byte[]>> GenerateAsync(AudioGenerationRequest request, CancellationToken ct = default) {
        logger.LogWarning("ElevenLabs audio provider is not yet implemented");
        return Task.FromResult(Result.Failure<byte[]>(null!, "ElevenLabs audio generation is not yet implemented"));
    }
}
