namespace VttTools.AI.Services;

public class VideoGenerationService(
    IAiProviderFactory providerFactory)
    : IVideoGenerationService {

    public async Task<Result<VideoGenerationResponse>> GenerateAsync(
        VideoGenerationRequest request,
        CancellationToken ct = default) {
        var provider = providerFactory.GetVideoProvider(request.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(request, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure<VideoGenerationResponse>(null!, result.Errors[0].Message)
            : (Result<VideoGenerationResponse>)new VideoGenerationResponse {
                VideoData = result.Value,
                ContentType = "video/mp4",
                Provider = provider.ProviderType,
                Model = request.Model,
                Duration = request.Duration ?? TimeSpan.Zero,
                Cost = 0m,
            };
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default) => Task.FromResult(providerFactory.GetAvailableVideoProviders());
}
