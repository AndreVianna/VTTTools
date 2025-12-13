namespace VttTools.AI.Services;

public class ImageGenerationService(IAiProviderFactory providerFactory)
    : IImageGenerationService {

    public async Task<Result<ImageGenerationResponse>> GenerateAsync(
        ImageGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<ImageGenerationResponse>(null!, validation.Errors);

        var provider = providerFactory.GetImageProvider(data.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(data, ct);
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
}
