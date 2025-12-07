namespace VttTools.AI.Providers.RunwayML;

public sealed class RunwayVideoProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<RunwayVideoProvider> logger) : IVideoProvider {

    public AiProviderType ProviderType => AiProviderType.RunwayML;

    public Task<Result<byte[]>> GenerateAsync(VideoGenerationRequest request, CancellationToken ct = default) {
        logger.LogWarning("RunwayML video provider is not yet implemented");
        return Task.FromResult(Result.Failure<byte[]>(null!, "RunwayML video generation is not yet implemented"));
    }
}
