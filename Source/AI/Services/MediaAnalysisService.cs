namespace VttTools.AI.Services;

public class MediaAnalysisService(
    IHttpClientFactory httpClientFactory,
    IOptionsSnapshot<AiOptions> options,
    IAiProviderFactory providerFactory,
    ILogger<MediaAnalysisService> logger)
    : IMediaAnalysisService {

    private const string _systemPrompt = """
        You are a media analysis assistant for a virtual tabletop (VTT) application.
        Analyze the provided media and extract metadata suitable for organizing game assets.

        For images: Look for characters, creatures, items, locations, or scenes.
        For videos: Describe the overall content and any notable elements.
        For audio: Describe the type of sound (music, ambient, voice, sound effect).

        Provide your response in JSON format with these fields:
        - suggestedName: A concise, descriptive name for the asset (2-5 words)
        - description: A brief description of the content (1-2 sentences)
        - tags: An array of relevant tags (3-8 tags, lowercase, single words or short phrases)

        Example response:
        {
            "suggestedName": "Ancient Dragon Portrait",
            "description": "A majestic red dragon with golden eyes perched on a mountain peak.",
            "tags": ["dragon", "creature", "portrait", "fantasy", "monster", "red dragon"]
        }
        """;

    public async Task<Result<MediaAnalysisResult>> AnalyzeAsync(
        MediaAnalysisRequest request,
        CancellationToken ct = default) {
        try {
            logger.LogDebug("Starting media analysis for {FileName} ({MediaType})", request.FileName, request.MediaType);

            (var provider, var model) = providerFactory.GetProviderAndModel(GeneratedContentType.MediaAnalysis);

            if (provider != "OpenAI") {
                return Result.Failure<MediaAnalysisResult>(null!, $"Media analysis only supports OpenAI provider, got: {provider}");
            }

            using var client = CreateAuthenticatedClient();
            var apiRequest = CreateVisionRequest(model, request);

            using var response = await client.PostAsJsonAsync("/v1/chat/completions", apiRequest, JsonDefaults.SnakeCaseOptions, ct);

            if (!response.IsSuccessStatusCode) {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                logger.LogWarning("OpenAI API error during media analysis: {StatusCode} - {Error}", response.StatusCode, errorBody);
                return Result.Failure<MediaAnalysisResult>(null!, $"OpenAI API error: {response.StatusCode}");
            }

            var contentString = await response.Content.ReadAsStringAsync(ct);
            var apiResponse = JsonSerializer.Deserialize<OpenAiTextResponse>(contentString, JsonDefaults.SnakeCaseOptions);

            if (apiResponse?.Choices is not { Length: > 0 } || string.IsNullOrEmpty(apiResponse.Choices[0].Message?.Content)) {
                return Result.Failure<MediaAnalysisResult>(null!, "Empty response from OpenAI API");
            }

            var analysisResult = ParseAnalysisResponse(apiResponse.Choices[0].Message!.Content);
            logger.LogInformation("Media analysis completed for {FileName}", request.FileName);

            return Result.Success(analysisResult);
        }
        catch (JsonException ex) {
            logger.LogError(ex, "Failed to parse media analysis response");
            return Result.Failure<MediaAnalysisResult>(null!, $"Failed to parse analysis response: {ex.Message}");
        }
        catch (HttpRequestException ex) {
            logger.LogError(ex, "Network error during media analysis");
            return Result.Failure<MediaAnalysisResult>(null!, $"Network error: {ex.Message}");
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during media analysis");
            return Result.Failure<MediaAnalysisResult>(null!, $"Unexpected error: {ex.Message}");
        }
    }

    private HttpClient CreateAuthenticatedClient() {
        var providerConfig = options.Value.Providers.TryGetValue("OpenAI", out var config)
            ? config
            : throw new InvalidOperationException("OpenAI provider is not configured.");

        var client = httpClientFactory.CreateClient(Extensions.HostApplicationBuilderExtensions.AiProviderHttpClientName);
        client.BaseAddress = new Uri(providerConfig.BaseUrl);

        var apiKey = providerConfig.ApiKey
            ?? throw new InvalidOperationException("OpenAI API key is not configured.");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");

        return client;
    }

    private static object CreateVisionRequest(string model, MediaAnalysisRequest request) {
        var userContent = new List<object> {
            new {
                type = "text",
                text = $"Analyze this {request.MediaType} file named '{request.FileName}' and provide metadata for organizing it in a VTT asset library."
            }
        };

        if (request.MediaType is "image" or "video" && request.Frames is { Count: > 0 }) {
            foreach (var frame in request.Frames) {
                var base64Image = Convert.ToBase64String(frame);
                userContent.Add(new {
                    type = "image_url",
                    image_url = new {
                        url = $"data:image/png;base64,{base64Image}",
                        detail = "low"
                    }
                });
            }
        }

        if (request.MediaType == "audio" && request.AudioData is { Length: > 0 }) {
            userContent.Add(new {
                type = "text",
                text = "[Audio file - please analyze based on filename and any metadata available]"
            });
        }

        return new {
            model,
            messages = new object[] {
                new { role = "system", content = _systemPrompt },
                new { role = "user", content = userContent }
            },
            max_tokens = 500,
            temperature = 0.3
        };
    }

    private static MediaAnalysisResult ParseAnalysisResponse(string content) {
        content = content.Trim();
        if (content.StartsWith("```json")) {
            content = content[7..];
        }
        if (content.StartsWith("```")) {
            content = content[3..];
        }
        if (content.EndsWith("```")) {
            content = content[..^3];
        }
        content = content.Trim();

        try {
            var parsed = JsonSerializer.Deserialize<JsonElement>(content);
            return new MediaAnalysisResult {
                SuggestedName = parsed.TryGetProperty("suggestedName", out var name) ? name.GetString() : null,
                Description = parsed.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                Tags = parsed.TryGetProperty("tags", out var tags) && tags.ValueKind == JsonValueKind.Array
                    ? [.. tags.EnumerateArray().Select(t => t.GetString()!).Where(t => t is not null)]
                    : null
            };
        }
        catch {
            return new MediaAnalysisResult {
                Description = content
            };
        }
    }
}
