namespace VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

public sealed class OpenAiImageGenerator(
    IHttpClientFactory httpClientFactory,
    IConfiguration config) : IImageGenerator {
    private readonly OpenAiHttpClientHelper _helper = new(httpClientFactory, config);

    public async Task<ImageGenerationResponse> GenerateImageFileAsync(
        string model,
        string imageType,
        string prompt,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        try {
            var request = CreateImageRequest(model, imageType, prompt);
            var responseBody = await SendImageRequestAsync(model, request, ct);

            return !IsValidResponse(responseBody)
                ? CreateErrorResponse("OpenAI API returned empty response", stopwatch.Elapsed)
                : CreateSuccessResponse(model, responseBody!, stopwatch.Elapsed);
        }
        catch (HttpRequestException ex) {
            return CreateErrorResponse($"Network error: {ex.Message}", stopwatch.Elapsed);
        }
        catch (JsonException ex) {
            return CreateErrorResponse($"JSON deserialization error: {ex.Message}", stopwatch.Elapsed);
        }
        catch (Exception ex) {
            return CreateErrorResponse($"Unexpected error: {ex.Message}", stopwatch.Elapsed);
        }
    }

    private OpenAiImageRequest CreateImageRequest(string model, string imageType, string prompt) => new(
        Model: model,
        Prompt: prompt,
        OutputFormat: "png",
        Size: GetImageSize(imageType),
        Background: config[$"Images:{imageType}:Background"] ?? "auto");

    private async Task<OpenAiImageResponse?> SendImageRequestAsync(
        string model,
        OpenAiImageRequest request,
        CancellationToken ct) {
        var endpoint = _helper.GetEndpoint(model);
        using var client = _helper.CreateAuthenticatedClient();
        return await OpenAiHttpClientHelper.PostAndDeserializeAsync<OpenAiImageResponse>(client, endpoint, request, ct);
    }

    private static bool IsValidResponse(OpenAiImageResponse? response)
        => response is not null
        && response.Data?.Length > 0
        && !string.IsNullOrEmpty(response.Data[0].Content);

    private static ImageGenerationResponse CreateSuccessResponse(
        string model,
        OpenAiImageResponse responseBody,
        TimeSpan duration) {
        var imageData = Convert.FromBase64String(responseBody.Data![0].Content);
        var calculator = OpenAiHttpClientHelper.GetImagePricingCalculator(model);
        var cost = calculator.Calculate(
            responseBody.Usage!.InputTokens,
            responseBody.Usage!.OutputTokens);

        CostCalculation.LogCost(cost);

        return new ImageGenerationResponse(
            Data: imageData,
            IsSuccess: true,
            TotalTokens: cost.TotalTokens,
            TotalCost: cost.TotalCost,
            Duration: duration);
    }

    private static ImageGenerationResponse CreateErrorResponse(string errorMessage, TimeSpan duration)
        => new(
            Data: [],
            IsSuccess: false,
            ErrorMessage: errorMessage,
            Duration: duration);

    private string GetImageSize(string imageType) {
        var aspectRatio = config[$"Images:{imageType}:AspectRatio"] ?? "1:1";
        return aspectRatio switch {
            "1:1" => "1024x1024",
            "2:3" => "1024x1536",
            _ => throw new InvalidOperationException($"Unsupported aspect ratio {aspectRatio} for image type {imageType}")
        };
    }

    private sealed record OpenAiImageRequest(
        [property: JsonPropertyName("model")] string Model,
        [property: JsonPropertyName("prompt")] string Prompt,
        [property: JsonPropertyName("output_format")] string OutputFormat,
        [property: JsonPropertyName("size")] string Size,
        [property: JsonPropertyName("background")] string Background);

    private sealed record OpenAiImageResponse(
        [property: JsonPropertyName("id")] string? Id,
        [property: JsonPropertyName("data")] OpenAiDataItem[]? Data,
        [property: JsonPropertyName("usage")] OpenAiUsage? Usage);

    private sealed record OpenAiDataItem(
        [property: JsonPropertyName("b64_json")] string Content);
}