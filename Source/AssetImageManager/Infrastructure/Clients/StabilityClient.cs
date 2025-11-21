namespace VttTools.AssetImageManager.Infrastructure.Clients;

public sealed class StabilityClient(IHttpClientFactory httpClientFactory, IConfiguration config)
    : IImageGenerator {
    public async Task<ImageGenerationResponse> GenerateImageFileAsync(string model, string imageType, string prompt, CancellationToken ct = default) {
        using var input = new MultipartFormDataContent();

        AddFormField(input, "prompt", prompt);
        AddFormField(input, "mode", "text-to-image");
        AddFormField(input, "output_format", "png");
        AddFormField(input, "cfg_scale", "10");
        var aspectRatio = GetAspectRatio(imageType);
        AddFormField(input, "aspect_ratio", GetAspectRatio(imageType));
        AddFormField(input, "negative_prompt", GetNegativePrompt(imageType));

        var path = GetEndpoint(model);
        using var client = CreateClient();
        using var response = await client.PostAsync(path, input, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"Stability API error {(int)response.StatusCode}: {response.ReasonPhrase}\nDetails: {errorBody}");
        }

        var imageData = await response.Content.ReadAsByteArrayAsync(ct);
        return new ImageGenerationResponse(imageData, true);
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
        var baseUrl = config["Providers:Stability:BaseUrl"] ?? throw new InvalidOperationException("Stability AI API base url not configured.");
        client.BaseAddress = new Uri(baseUrl);
        var apiKey = config["Providers:Stability:ApiKey"] ?? throw new InvalidOperationException("Stability AI API key is not configured.");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");
        return client;
    }

    private string GetEndpoint(string model)
        => config[$"Providers:Stability:{model}"] ?? throw new InvalidOperationException("Stability API image generation endpoint is not configured.");

    private const string _genericNegativePrompt = "border, frame, text, watermark, signature, blurry, low quality, cropped edges, multiple subjects, duplicates";

    private string GetNegativePrompt(string imageType) {
        var specificNegativesPrompt = config[$"Images:{imageType}:NegativePrompt"] ?? string.Empty;
        return string.IsNullOrWhiteSpace(specificNegativesPrompt)
            ? _genericNegativePrompt
            : $"{_genericNegativePrompt}, {specificNegativesPrompt}";
    }

    private string GetAspectRatio(string imageType)
        => config[$"Images:{imageType}:AspectRatio"] ?? "1:1";
}
