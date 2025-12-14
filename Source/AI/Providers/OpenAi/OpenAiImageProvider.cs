namespace VttTools.AI.Providers.OpenAi;

public sealed class OpenAiImageProvider(
    IHttpClientFactory httpClientFactory,
    IOptionsSnapshot<AiOptions> options,
    ILogger<OpenAiImageProvider> logger) : IImageProvider {
    private readonly OpenAiHttpHelper _helper = new(httpClientFactory, options);

    public string Name => "OpenAI";

    public async Task<Result<byte[]>> GenerateAsync(
        ImageGenerationData data,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        try {
            var model = data.Model
                ?? throw new InvalidOperationException("Model must be specified for image generation.");

            logger.LogDebug("Starting OpenAI image generation with model {Model}", model);

            var apiRequest = CreateImageRequest(model, data);
            var endpoint = OpenAiHttpHelper.GetEndpoint(model);

            using var client = _helper.CreateAuthenticatedClient();
            var response = await OpenAiHttpHelper.PostAndDeserializeAsync<OpenAiImageResponse>(client, endpoint, apiRequest, ct);

            if (!IsValidResponse(response)) {
                logger.LogWarning("OpenAI API returned empty or invalid response");
                return Result.Failure("OpenAI API returned empty response");
            }

            var imageData = Convert.FromBase64String(response!.Data![0].Content);
            var calculator = OpenAiHttpHelper.GetImagePricingCalculator(model);
            var cost = calculator.Calculate(
                response.Usage!.InputTokens,
                response.Usage!.OutputTokens);

            stopwatch.Stop();
            logger.LogInformation(
                "OpenAI image generation completed in {Duration}ms - Tokens: {TotalTokens}, Cost: ${TotalCost:F4}",
                stopwatch.ElapsedMilliseconds,
                cost.TotalTokens,
                cost.TotalCost);

            return Result.Success(imageData);
        }
        catch (HttpRequestException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Network error during OpenAI image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Network error: {ex.Message}");
        }
        catch (JsonException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "JSON deserialization error during OpenAI image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"JSON deserialization error: {ex.Message}");
        }
        catch (Exception ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Unexpected error during OpenAI image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Unexpected error: {ex.Message}");
        }
    }

    private static OpenAiImageRequest CreateImageRequest(string model, ImageGenerationData data) {
        var size = GetImageSize(data);
        return new OpenAiImageRequest(
            Model: model,
            Prompt: data.Prompt,
            OutputFormat: "png",
            Size: size,
            Background: "auto");
    }

    private static string GetImageSize(ImageGenerationData request) => request.Width is not null && request.Height is not null
            ? $"{request.Width}x{request.Height}"
            : request.AspectRatio switch {
                "1:1" => "1024x1024",
                "2:3" => "1024x1536",
                "3:2" => "1536x1024",
                "16:9" => "1792x1024",
                "9:16" => "1024x1792",
                _ => throw new InvalidOperationException($"Unsupported aspect ratio {request.AspectRatio}")
            };

    private static bool IsValidResponse(OpenAiImageResponse? response)
        => response is not null
        && response.Data?.Length > 0
        && !string.IsNullOrEmpty(response.Data[0].Content);
}
