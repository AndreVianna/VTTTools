namespace VttTools.AI.Services;

public class VideoGenerationService(IAiProviderFactory providerFactory)
    : IVideoGenerationService {

    public async Task<Result<VideoGenerationResponse>> GenerateAsync(
        VideoGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<VideoGenerationResponse>(null!, validation.Errors);

        var resolvedData = ResolveProviderAndModel(data);
        var provider = providerFactory.GetVideoProvider(resolvedData.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(resolvedData, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure(result.Errors).WithNo<VideoGenerationResponse>()
            : new VideoGenerationResponse {
                VideoData = result.Value,
                ContentType = "video/mp4",
                InputTokens = 0,
                OutputTokens = 0,
                Cost = 0m,
                Elapsed = stopwatch.Elapsed,
            };
    }

    public IReadOnlyList<string> GetAvailableProviders()
        => providerFactory.GetAvailableVideoProviders();

    private VideoGenerationData ResolveProviderAndModel(VideoGenerationData data) {
        if (!string.IsNullOrEmpty(data.Provider) && !string.IsNullOrEmpty(data.Model))
            return data;

        (var provider, var model) = providerFactory.GetProviderAndModel(data.ContentType);
        return data with {
            Provider = data.Provider ?? provider,
            Model = data.Model ?? model,
        };
    }
}
