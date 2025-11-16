namespace VttTools.TokenManager.Infrastructure.Stability;

public sealed class StabilityClient {
    private readonly HttpClient _http;
    private readonly string _engineId;

    private static readonly JsonSerializerOptions _jsonOptions = new() { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };

    public StabilityClient(HttpClient http, string apiKey, string engineId) {
        _http = http;
        _engineId = engineId;
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<byte[]> GeneratePngAsync(string prompt) {
        var request = new StabilityRequest(
            TextPrompts: [ new TextPrompt(prompt, 1.0) ],
            CfgScale: 7,
            Height: 512,
            Width: 512,
            Steps: 30,
            Samples: 1
        );

        var json = JsonSerializer.Serialize(request, _jsonOptions);

        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await _http.PostAsync($"/v1/generation/{_engineId}/text-to-image", content);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Stability API error {(int)response.StatusCode}: {response.ReasonPhrase}\n{errorBody}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<StabilityResponse>(responseJson)
                     ?? throw new InvalidOperationException("Empty Stability response.");

        var artifact = result.Artifacts.FirstOrDefault(a => a.Base64 is not null)
                       ?? throw new InvalidOperationException("No image artifact returned.");

        return Convert.FromBase64String(artifact.Base64!);
    }

    private sealed record StabilityRequest(
        [property: JsonPropertyName("text_prompts")] IReadOnlyList<TextPrompt> TextPrompts,
        [property: JsonPropertyName("cfg_scale")] int CfgScale,
        [property: JsonPropertyName("height")] int Height,
        [property: JsonPropertyName("width")] int Width,
        [property: JsonPropertyName("steps")] int Steps,
        [property: JsonPropertyName("samples")] int Samples);

    private sealed record TextPrompt(
        [property: JsonPropertyName("text")] string Text,
        [property: JsonPropertyName("weight")] double Weight);

    private sealed record StabilityResponse(
        [property: JsonPropertyName("artifacts")] IReadOnlyList<StabilityArtifact> Artifacts);

    private sealed record StabilityArtifact(
        [property: JsonPropertyName("base64")] string? Base64,
        [property: JsonPropertyName("seed")] long? Seed,
        [property: JsonPropertyName("finishReason")] string? FinishReason);
}
