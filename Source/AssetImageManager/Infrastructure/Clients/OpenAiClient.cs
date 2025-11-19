namespace VttTools.AssetImageManager.Infrastructure.Clients;

public sealed class OpenAiClient(IHttpClientFactory httpClientFactory, IConfiguration config)
    : IPromptEnhancer, IImageGenerator {
    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public async Task<PromptEnhancerResponse> EnhancePromptAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        string imageType,
        CancellationToken ct = default) {

        var model = config["PromptEnhancer:Model"]
            ?? throw new InvalidOperationException("OpenAI model is not configured.");

        var stopwatch = Stopwatch.StartNew();
        try {
            var systemPrompt = GetSystemPrompt(entity, imageType);
            var userPrompt = GetUserPrompt(entity, variant, imageType);
            var apiRequest = new {
                model,
                instructions = systemPrompt,
                input = userPrompt,
            };

            using var client = CreateClient();
            var endpoint = GetEndpoint(model);
            using var response = await client.PostAsJsonAsync(endpoint, apiRequest, ct);

            if (!response.IsSuccessStatusCode) {
                var errtResponseBody = await response.Content.ReadAsStringAsync(ct);
                return CreateErrorResponse((int)response.StatusCode, stopwatch.Elapsed);
            }

            var responseString = await response.Content.ReadAsStringAsync(ct);
            var responseBody = JsonSerializer.Deserialize<OpenAiResponseObject>(responseString, _jsonOptions);

            if (responseBody is null || responseBody.Output is null || responseBody.Output.Length == 0) {
                return new PromptEnhancerResponse(
                    Prompt: string.Empty,
                    IsSuccess: false,
                    ErrorMessage: "OpenAI API returned empty response",
                    Duration: stopwatch.Elapsed);
            }

            var outputItem = responseBody.Output[1];
            if (outputItem.Content is null || outputItem.Content.Length == 0) {
                return new PromptEnhancerResponse(
                    Prompt: string.Empty,
                    IsSuccess: false,
                    ErrorMessage: "OpenAI API returned empty content",
                    Duration: stopwatch.Elapsed);
            }

            var text = outputItem.Content[0].Text ?? string.Empty;

            return new PromptEnhancerResponse(
                Prompt: text,
                IsSuccess: true,
                TotalTokens: responseBody.Usage?.TotalTokens ?? 0,
                TotalCost: 0.0,
                Duration: stopwatch.Elapsed);
        }
        catch (HttpRequestException ex) {
            return new PromptEnhancerResponse(
                Prompt: string.Empty,
                IsSuccess: false,
                ErrorMessage: $"Network error: {ex.Message}",
                Duration: stopwatch.Elapsed);
        }
        catch (JsonException ex) {
            return new PromptEnhancerResponse(
                Prompt: string.Empty,
                IsSuccess: false,
                ErrorMessage: $"JSON deserialization error: {ex.Message}",
                Duration: stopwatch.Elapsed);
        }
        catch (Exception ex) {
            return new PromptEnhancerResponse(
                Prompt: string.Empty,
                IsSuccess: false,
                ErrorMessage: $"Unexpected error: {ex.Message}",
                Duration: stopwatch.Elapsed);
        }
    }

    public async Task<ImageGenerationResponse> GenerateImageAsync(string model, string imageType, string prompt, CancellationToken ct = default) {
        var request = new {
            Model = model,
            Prompt = prompt,
            OutputFormat = "png",
            Size = GetAspectRatio(imageType) switch {
                "1:1" => "1024x1024",
                "2:3" => "1024x1536",
                _ => throw new InvalidOperationException($"Unsupported aspect ratio for image type {imageType}")
            },
            Background = config[$"Images:{imageType}:Background"] ?? "auto"
        };

        var path = GetEndpoint(model);
        using var client = CreateClient();
        using var response = await client.PostAsJsonAsync(path, request, _jsonOptions, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"OpenAI API error {(int)response.StatusCode}: {response.ReasonPhrase}\nDetails: {errorBody}");
        }

        var contentString = await response.Content.ReadAsStringAsync(ct);
        var content = JsonSerializer.Deserialize<ImageResponse>(contentString, _jsonOptions);
        var imageData = content?.Data?.FirstOrDefault()?.Content
            ?? throw new InvalidOperationException("OpenAI API returned empty image data.");

        var inputPricePerM = model == "gpt-image-1" ? 10.0 : 2.5;
        var inputCost = inputPricePerM * content.Usage.InputTokens / 1000000.0;
        var outputPricePerM = model == "gpt-image-1" ? 40.0 : 8.0;
        var outputCost = outputPricePerM * content.Usage.OutputTokens / 1000000.0;
        var totalCost = inputCost + outputCost;
        Console.Write($"Cost: ${inputCost:0.0000000} ({content.Usage.InputTokens}) + ${outputCost:0.0000000} ({content.Usage.OutputTokens}) = ${totalCost:0.0000000};");
        return new ImageGenerationResponse(
            Convert.FromBase64String(imageData),
            true,
            TotalTokens: content.Usage.TotalTokens,
            TotalCost: totalCost);
    }

    private sealed class ImageResponse {
        public ImageData[] Data { get; set; } = [];
        public UsageData Usage { get; set; } = new UsageData();
    }

    private sealed class ImageData {
        [JsonPropertyName("b64_json")]
        public string Content { get; set; } = string.Empty;
    }

    private sealed class UsageData {
        public int TotalTokens { get; set; }
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
    }

    private HttpClient CreateClient() {
        var client = httpClientFactory.CreateClient();
        var baseUrl = config["Providers:OpenAI:BaseUrl"] ?? throw new InvalidOperationException("OpenAI API base url not configured.");
        client.BaseAddress = new Uri(baseUrl);
        var apiKey = config["Providers:OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI API key is not configured.");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");
        return client;
    }

    private string GetEndpoint(string model)
        => config[$"Providers:OpenAI:{model}"] ?? throw new InvalidOperationException($"OpenAI API {model} endpoint is not configured.");

    private string GetAspectRatio(string imageType)
        => config[$"Images:{imageType}:AspectRatio"] ?? "1:1";

    private static string GetSystemPrompt(EntityDefinition entity, string imageType) {
        var sb = new StringBuilder();
        sb.AppendLine($"You are an expert at creating image generation prompts for a high quality {entity.Genre} {entity.Category} illustration.");
        sb.AppendLine($"You must ensure that the image is {GetImageFormat(imageType)}.");
        return sb.ToString();
    }

    private static string GetUserPrompt(EntityDefinition entity, StructuralVariant variant, string imageType) {
        var sb = new StringBuilder();
        sb.AppendLine("Create a detailed prompt that generates an image that captures all of the folloing elements:");
        sb.AppendLine($"The image represents a{GetDescription(entity, variant)} {entity.Name}. ");
        if (!string.IsNullOrWhiteSpace(entity.PhysicalDescription))
            sb.AppendLine($"The subject is described as {entity.PhysicalDescription}. ");
        if (!string.IsNullOrWhiteSpace(entity.DistinctiveFeatures))
            sb.AppendLine($"The subject has these characteristics: {entity.DistinctiveFeatures}. ");
        if (entity.Category == "Object") {
            if (!string.IsNullOrWhiteSpace(variant.Material) || !string.IsNullOrWhiteSpace(variant.Quality))
                sb.AppendLine($"The subject is made of{GetMaterial(variant)}.");
        }
        else if (!string.IsNullOrWhiteSpace(variant.Equipment) || !string.IsNullOrWhiteSpace(variant.Vestiment)) {
            sb.AppendLine($"The subject is{GetEquipment(variant)}{GetVestiment(variant)}.");
        }
        if (imageType == ImageType.Portrait && !string.IsNullOrWhiteSpace(entity.Environment))
            sb.Append($"The subject is shown in {entity.Environment}.");
        return sb.ToString();
    }

    private static string Spaced(string? value)
        => string.IsNullOrWhiteSpace(value) ? "" : $" {value}";

    private static string GetDescription(EntityDefinition entity,  StructuralVariant variant)
        => Spaced(variant.Size) + Spaced(variant.Gender) + GetType(entity);

    private static string GetType(EntityDefinition entity)
        => string.IsNullOrWhiteSpace(entity.Type) ? ""
        : string.IsNullOrWhiteSpace(entity.Subtype) ? $" {entity.Type}"
        : $" {entity.Type} ({entity.Subtype})";

    private static string GetEquipment(StructuralVariant variant)
        => string.IsNullOrWhiteSpace(variant.Equipment) ? ""
        : $" holding {variant.Equipment}";

    private static string GetVestiment(StructuralVariant variant)
        => string.IsNullOrWhiteSpace(variant.Vestiment) ? ""
        : $" wearing {variant.Vestiment}";

    private static string GetMaterial(StructuralVariant variant)
        => string.IsNullOrWhiteSpace(variant.Material) ? ""
        : string.IsNullOrWhiteSpace(variant.Quality) ? $" {variant.Quality} {variant.Material}"
        : $" {variant.Material}";

    private static string GetImageFormat(string imageType)
        => imageType switch {
            ImageType.TopDown => "birb's eye top-down view of the subject to be seemless integrated in a virtual table top map",
            ImageType.Photo => "close-up photo of the main features of the subject used as a token in a virtual table top map",
            _ => "subject portrait, displaying it's full view of the subject, to be used as a illustration of the subject in a book or a display panel",
        };

    private static PromptEnhancerResponse CreateErrorResponse(int statusCode, TimeSpan duration) {
        var errorMessage = statusCode switch {
            401 => "Authentication failed. Check API key configuration.",
            429 => "Rate limit exceeded. Please try again later.",
            >= 500 => "OpenAI service unavailable. Please try again later.",
            _ => $"OpenAI API error ({statusCode})"
        };

        return new PromptEnhancerResponse(
            Prompt: string.Empty,
            IsSuccess: false,
            ErrorMessage: errorMessage,
            Duration: duration);
    }

    private sealed record OpenAiResponseObject(
        [property: JsonPropertyName("id")] string? Id,
        [property: JsonPropertyName("object")] string? ObjectType,
        [property: JsonPropertyName("created_at")] long CreatedAt,
        [property: JsonPropertyName("status")] string? Status,
        [property: JsonPropertyName("error")] object? Error,
        [property: JsonPropertyName("model")] string? Model,
        [property: JsonPropertyName("output")] OpenAiOutputItem[]? Output,
        [property: JsonPropertyName("usage")] OpenAiUsage? Usage);

    private sealed record OpenAiOutputItem(
        [property: JsonPropertyName("type")] string? Type,
        [property: JsonPropertyName("id")] string? Id,
        [property: JsonPropertyName("status")] string? Status,
        [property: JsonPropertyName("role")] string? Role,
        [property: JsonPropertyName("content")] OpenAiContentItem[]? Content);

    private sealed record OpenAiContentItem(
        [property: JsonPropertyName("type")] string? Type,
        [property: JsonPropertyName("text")] string? Text,
        [property: JsonPropertyName("annotations")] object[]? Annotations);

    private sealed record OpenAiUsage(
        [property: JsonPropertyName("input_tokens")] int InputTokens,
        [property: JsonPropertyName("output_tokens")] int OutputTokens,
        [property: JsonPropertyName("total_tokens")] int TotalTokens);
}
