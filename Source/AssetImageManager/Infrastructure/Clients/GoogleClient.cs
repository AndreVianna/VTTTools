namespace VttTools.AssetImageManager.Infrastructure.Clients;

public sealed class GoogleClient(IHttpClientFactory httpClientFactory, IConfiguration config)
    : IImageGenerator
{
    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public async Task<ImageGenerationResponse> GenerateImageFileAsync(string model, string imageType, string prompt, CancellationToken ct = default) {
        var request = new {
            Contents = new[] {
                new {
                    Parts = new[] {
                        new {
                            Text = prompt,
                        }
                    },
                }
            },
            GenerationConfig = new {
                ResponseModalities = new[]  { "Image" },
                ImageConfig = new {
                    AspectRatio = GetAspectRatio(imageType),
                }
            }
        };

        var path = GetEndpoint(model);
        using var client = CreateClient();
        using var response = await client.PostAsJsonAsync(path, request, _jsonOptions, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"Google API error {(int)response.StatusCode}: {response.ReasonPhrase}\nDetails: {errorBody}");
        }

        var contentString = await response.Content.ReadAsStringAsync(ct);
        var content = JsonSerializer.Deserialize<ImageResponse>(contentString, _jsonOptions);
        var imageData = content?.Candidates[0].Content.Parts[0].InlineData.Content
            ?? throw new InvalidOperationException("Google API returned empty image data.");

        const double inputPricePerM = 0.3;
        var inputCost = inputPricePerM * content.UsageMetadata.PromptTokenCount / 1000000.0;
        const double outputPricePerM = 30.0;
        var outputCost = outputPricePerM * content.UsageMetadata.CandidatesTokenCount / 1000000.0;
        var totalCost = inputCost + outputCost;
        ConsoleOutput.WriteCost(
            content.UsageMetadata.PromptTokenCount,
            inputCost,
            content.UsageMetadata.CandidatesTokenCount,
            outputCost,
            content.UsageMetadata.TotalTokenCount,
            totalCost);
        return new ImageGenerationResponse(
            Convert.FromBase64String(imageData),
            true,
            TotalTokens: content.UsageMetadata.TotalTokenCount,
            TotalCost: totalCost);
    }

    private sealed class ImageResponse {
        public Candidate[] Candidates { get; set; } = [];
        public UsageData UsageMetadata { get; set; } = new();
    }

    private sealed class Candidate {
        public CandidateContent Content { get; set; } = new();
    }

    private sealed class CandidateContent {
        public ContentPart[] Parts { get; set; } = [];
    }

    private sealed class ContentPart {
        public ImageData InlineData { get; set; } = new();
    }

    private sealed class ImageData {
        public string MimeType { get; set; } = string.Empty;
        [JsonPropertyName("data")]
        public string Content { get; set; } = string.Empty;
    }

    private sealed class UsageData {
        public int PromptTokenCount { get; set; }
        public int CandidatesTokenCount { get; set; }
        public int TotalTokenCount { get; set; }
    }

    private HttpClient CreateClient()
    {
        var client = httpClientFactory.CreateClient();
        var baseUrl = config["Providers:Google:BaseUrl"] ?? throw new InvalidOperationException("Google AI API base url not configured.");
        client.BaseAddress = new Uri(baseUrl);
        var apiKey = config["Providers:Google:ApiKey"] ?? throw new InvalidOperationException("Google AI API key is not configured.");
        client.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");
        return client;
    }

    private string GetEndpoint(string model)
        => config[$"Providers:Google:{model}"] ?? throw new InvalidOperationException("Google API image generation endpoint is not configured.");

    private string GetAspectRatio(string imageType)
        => config[$"Images:{imageType}:AspectRatio"] ?? "1:1";
}
