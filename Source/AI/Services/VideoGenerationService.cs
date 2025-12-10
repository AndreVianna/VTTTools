namespace VttTools.AI.Services;

public class VideoGenerationService(IAiProviderFactory providerFactory)
    : IVideoGenerationService {

    public async Task<Result<VideoGenerationResponse>> GenerateAsync(
        VideoGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<VideoGenerationResponse>(null!, validation.Errors);

        var provider = providerFactory.GetVideoProvider(data.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(data, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure<VideoGenerationResponse>(null!, result.Errors[0].Message)
            : (Result<VideoGenerationResponse>)new VideoGenerationResponse {
                VideoData = result.Value,
                ContentType = "video/mp4",
                Provider = provider.ProviderType,
                Model = data.Model,
                Duration = data.Duration ?? TimeSpan.Zero,
                Cost = 0m,
            };
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default) => Task.FromResult(providerFactory.GetAvailableVideoProviders());
}
