namespace VttTools.AI.Services;

public class ImageGenerationService(IAiProviderFactory providerFactory)
    : IImageGenerationService {

    public async Task<Result<ImageGenerationResponse>> GenerateAsync(
        ImageGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<ImageGenerationResponse>(null!, validation.Errors);

        var resolvedData = ResolveProviderAndModel(data);
        var provider = providerFactory.GetImageProvider(resolvedData.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(resolvedData, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure(result.Errors).WithNo<ImageGenerationResponse>()
            : new ImageGenerationResponse {
                ImageData = result.Value,
                ContentType = "image/png",
                InputTokens = 0,
                OutputTokens = 0,
                Cost = 0m,
                Elapsed = stopwatch.Elapsed,
            };
    }

    public IReadOnlyList<string> GetAvailableProviders()
        => providerFactory.GetAvailableImageProviders();

    private ImageGenerationData ResolveProviderAndModel(ImageGenerationData data) {
        if (!string.IsNullOrEmpty(data.Provider) && !string.IsNullOrEmpty(data.Model))
            return data;

        (var provider, var model) = providerFactory.GetProviderAndModel(data.ContentType);
        return data with {
            Provider = data.Provider ?? provider,
            Model = data.Model ?? model,
        };
    }
}
