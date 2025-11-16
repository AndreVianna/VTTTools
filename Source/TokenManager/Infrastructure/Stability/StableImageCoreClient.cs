namespace VttTools.TokenManager.Infrastructure.Stability;

public sealed class StableImageCoreClient : IStabilityClient {
    private readonly HttpClient _http;
    private readonly string _baseAddress;

    public StableImageCoreClient(IHttpClientFactory httpClientFactory, IConfiguration config) {
        _baseAddress = config["Stability:Uri"] ?? throw new InvalidOperationException("ERROR: Stability URI is not configured.");
        var apiKey = config["Stability:ApiKey"] ?? throw new InvalidOperationException("ERROR: Stability API Key is not configured.");
        _http = httpClientFactory.CreateClient();
        _http.BaseAddress = new Uri(_baseAddress);
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<byte[]> GeneratePngAsync(string prompt, string? negativePrompt = null, string aspectRatio = "1:1", CancellationToken ct = default) {
        using var content = new MultipartFormDataContent();

        AddFormField(content, "prompt", prompt);
        AddFormField(content, "output_format", "png");
        AddFormField(content, "aspect_ratio", aspectRatio);
        AddFormField(content, "style_preset", "fantasy-art");
        AddFormField(content, "seed", "0");

        if (!string.IsNullOrWhiteSpace(negativePrompt))
            AddFormField(content, "negative_prompt", negativePrompt);

        using var response = await _http.PostAsync("/v2beta/stable-image/generate/core", content, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"Stability API error {(int)response.StatusCode}: {response.ReasonPhrase}\nDetails: {errorBody}");
        }

        return await response.Content.ReadAsByteArrayAsync(ct);
    }

    private static void AddFormField(MultipartFormDataContent content, string name, string value) {
        var field = new StringContent(value);
        field.Headers.ContentType = null;
        field.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data") {
            Name = $"\"{name}\""
        };
        content.Add(field);
    }
}
