namespace VttTools.AI.Providers.Google;

public sealed class GoogleImageProvider(
    IHttpClientFactory httpClientFactory,
    IOptionsSnapshot<AiOptions> options,
    ILogger<GoogleImageProvider> logger) : IImageProvider {
    private const string _providerName = "Google";

    public string Name => _providerName;

    public async Task<Result<byte[]>> GenerateAsync(
        ImageGenerationData data,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        try {
            var model = data.Model
                ?? throw new InvalidOperationException("Model must be specified for image generation.");

            logger.LogDebug("Starting Google AI image generation with model {Model}", model);

            var apiRequest = CreateImageRequest(data);
            var endpoint = GetEndpoint(model);

            using var client = CreateClient();
            using var response = await client.PostAsJsonAsync(endpoint, apiRequest, JsonDefaults.Options, ct);

            if (!response.IsSuccessStatusCode) {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                logger.LogWarning(
                    "Google API error {StatusCode}: {ReasonPhrase}. Details: {ErrorBody}",
                    (int)response.StatusCode,
                    response.ReasonPhrase,
                    errorBody);
                return Result.Failure(
                    $"Google API error {(int)response.StatusCode}: {response.ReasonPhrase}");
            }

            var contentString = await response.Content.ReadAsStringAsync(ct);
            var content = JsonSerializer.Deserialize<GoogleResponse>(contentString, JsonDefaults.Options);

            if (content?.Candidates is null || content.Candidates.Length == 0) {
                logger.LogWarning("Google API returned empty response");
                return Result.Failure("Google API returned empty image data");
            }

            var imageDataBase64 = content.Candidates[0].Content.Parts[0].InlineData.Content;
            if (string.IsNullOrEmpty(imageDataBase64)) {
                logger.LogWarning("Google API returned empty image data");
                return Result.Failure("Google API returned empty image data");
            }

            var imageData = Convert.FromBase64String(imageDataBase64);

            const double inputPricePerM = 0.3;
            var inputCost = inputPricePerM * content.UsageMetadata.PromptTokenCount / 1000000.0;
            const double outputPricePerM = 30.0;
            var outputCost = outputPricePerM * content.UsageMetadata.CandidatesTokenCount / 1000000.0;
            var totalCost = inputCost + outputCost;

            stopwatch.Stop();
            logger.LogInformation(
                "Google AI image generation completed in {Duration}ms - Tokens: {TotalTokens}, Cost: ${TotalCost:F4}",
                stopwatch.ElapsedMilliseconds,
                content.UsageMetadata.TotalTokenCount,
                totalCost);

            return Result.Success(imageData);
        }
        catch (HttpRequestException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Network error during Google image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Network error: {ex.Message}");
        }
        catch (JsonException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "JSON deserialization error during Google image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"JSON deserialization error: {ex.Message}");
        }
        catch (Exception ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Unexpected error during Google image generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Unexpected error: {ex.Message}");
        }
    }

    private static object CreateImageRequest(ImageGenerationData data) => new {
        Contents = new[] {
            new {
                Parts = new[] {
                    new {
                        Text = data.Prompt,
                    }
                },
            }
        },
        GenerationConfig = new {
            ResponseModalities = new[] { "DefaultDisplay" },
            ImageConfig = new {
                data.AspectRatio,
            }
        }
    };

    private HttpClient CreateClient() {
        var providerConfig = GetProviderConfig();
        var client = httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(providerConfig.BaseUrl);

        var apiKey = providerConfig.ApiKey
            ?? throw new InvalidOperationException("Google AI API key is not configured.");
        client.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");

        return client;
    }

    private ProviderConfig GetProviderConfig()
        => options.Value.Providers.TryGetValue(_providerName, out var config)
            ? config
            : throw new InvalidOperationException($"{_providerName} provider is not configured.");

    private static string GetEndpoint(string model)
        => model switch {
            "gemini-2.5-flash-image" => $"/v1beta/models/{model}:generateContent",
            _ => throw new InvalidOperationException($"Unknown Google model: {model}")
        };
}
