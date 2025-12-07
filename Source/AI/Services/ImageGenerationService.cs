namespace VttTools.AI.Services;

public class ImageGenerationService(
    IAiProviderFactory providerFactory)
    : IImageGenerationService {

    public async Task<Result<ImageGenerationResponse>> GenerateAsync(
        ImageGenerationRequest request,
        CancellationToken ct = default) {
        var provider = providerFactory.GetImageProvider(request.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(request, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure<ImageGenerationResponse>(null!, result.Errors[0].Message)
            : (Result<ImageGenerationResponse>)new ImageGenerationResponse {
                ImageData = result.Value,
                ContentType = "image/png",
                Provider = provider.ProviderType,
                Model = request.Model,
                TokensUsed = 0,
                Cost = 0m,
                Duration = stopwatch.Elapsed,
            };
    }

    public Task<IReadOnlyList<AiProviderType>> GetAvailableProvidersAsync(CancellationToken ct = default) => Task.FromResult(providerFactory.GetAvailableImageProviders());
}
