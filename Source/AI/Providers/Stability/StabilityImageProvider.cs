namespace VttTools.AI.Providers.Stability;

public sealed class StabilityImageProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<StabilityImageProvider> logger) : IImageProvider {

    public AiProviderType ProviderType => AiProviderType.Stability;

    public async Task<Result<byte[]>> GenerateAsync(
        ImageGenerationRequest request,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        try {
            var model = request.Model ?? configuration["AI:Providers:Stability:Models:Image"]
                ?? throw new InvalidOperationException("Stability image model not configured.");

            logger.LogDebug("Starting Stability AI image generation with model {Model}", model);

            using var formContent = CreateFormContent(request);
            var endpoint = GetEndpoint(model);

            using var client = CreateClient();
            using var response = await client.PostAsync(endpoint, formContent, ct);

            if (!response.IsSuccessStatusCode) {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                logger.LogWarning(
                    "Stability API error {StatusCode}: {ReasonPhrase}. Details: {ErrorBody}",
                    (int)response.StatusCode,
                    response.ReasonPhrase,
                    errorBody);
                return Result.Failure(
                    $"Stability API error {(int)response.StatusCode}: {response.ReasonPhrase}");
            }

            var imageData = await response.Content.ReadAsByteArrayAsync(ct);

            stopwatch.Stop();
            logger.LogInformation(
                "Stability AI image generation completed in {Duration}ms - Size: {Size} bytes",
                stopwatch.ElapsedMilliseconds,
                imageData.Length);

            return Result.Success(imageData);
        }
        catch (HttpRequestException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Network error during Stability image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Network error: {ex.Message}");
        }
        catch (Exception ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Unexpected error during Stability image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Unexpected error: {ex.Message}");
        }
    }

    private static MultipartFormDataContent CreateFormContent(ImageGenerationRequest request) {
        var content = new MultipartFormDataContent();

        AddFormField(content, "prompt", request.Prompt);
        AddFormField(content, "mode", "text-to-image");
        AddFormField(content, "output_format", "png");
        AddFormField(content, "cfg_scale", "10");
        AddFormField(content, "aspect_ratio", request.AspectRatio);

        if (!string.IsNullOrWhiteSpace(request.NegativePrompt)) {
            var negativePrompt = $"{_genericNegativePrompt}, {request.NegativePrompt}";
            AddFormField(content, "negative_prompt", negativePrompt);
        }
        else {
            AddFormField(content, "negative_prompt", _genericNegativePrompt);
        }

        return content;
    }

    private static void AddFormField(MultipartFormDataContent content, string name, string value) {
        var field = new StringContent(value);
        field.Headers.ContentType = null;
        field.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data") {
            Name = $"\"{name}\""
        };
        content.Add(field);
    }

    private HttpClient CreateClient() {
        var client = httpClientFactory.CreateClient();
        var baseUrl = configuration["AI:Providers:Stability:BaseUrl"]
            ?? throw new InvalidOperationException("Stability AI API base url not configured.");
        client.BaseAddress = new Uri(baseUrl);

        var apiKey = configuration["AI:Providers:Stability:ApiKey"]
            ?? throw new InvalidOperationException("Stability AI API key is not configured.");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");

        return client;
    }

    private static string GetEndpoint(string model)
        => model switch {
            "sd3" => "/v2beta/stable-image/generate/sd3",
            _ => throw new InvalidOperationException($"Unknown Stability model: {model}")
    };

    private const string _genericNegativePrompt = "border, frame, text, watermark, signature, blurry, low quality, cropped edges, multiple subjects, duplicates";
}
