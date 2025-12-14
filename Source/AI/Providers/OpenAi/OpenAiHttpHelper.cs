namespace VttTools.AI.Providers.OpenAi;

internal sealed class OpenAiHttpHelper(IHttpClientFactory httpClientFactory, IOptionsSnapshot<AiOptions> options) {
    private const string _providerName = "OpenAI";

    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public HttpClient CreateAuthenticatedClient() {
        var providerConfig = GetProviderConfig();
        var client = httpClientFactory.CreateClient(Extensions.HostApplicationBuilderExtensions.AiProviderHttpClientName);
        client.BaseAddress = new Uri(providerConfig.BaseUrl);

        var apiKey = providerConfig.ApiKey
            ?? throw new InvalidOperationException("OpenAI API key is not configured.");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");

        return client;
    }

    public static string GetEndpoint(string model)
        => model switch {
            "gpt-image-1" or "gpt-image-1-mini" => "/v1/images/generations",
            "gpt-4o" or "gpt-4o-mini" => "/v1/chat/completions",
            _ => throw new InvalidOperationException($"Unknown OpenAI model: {model}"),
        };

    private ProviderConfig GetProviderConfig()
        => options.Value.Providers.TryGetValue(_providerName, out var config)
            ? config
            : throw new InvalidOperationException($"{_providerName} provider is not configured.");

    public static async Task<T?> PostAndDeserializeAsync<T>(
        HttpClient client,
        string endpoint,
        object request,
        CancellationToken ct = default) {
        using var response = await client.PostAsJsonAsync(endpoint, request, _jsonOptions, ct);

        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException(
                $"OpenAI API error {(int)response.StatusCode}: {response.ReasonPhrase}\nDetails: {errorBody}");
        }

        var contentString = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<T>(contentString, _jsonOptions);
    }

    public static OpenAiPricingCalculator GetImagePricingCalculator(string model) {
        (var inputCost, var outputCost) = model switch {
            "gpt-image-1" => (10.0, 40.0),
            "gpt-image-1-mini" => (2.5, 8.0),
            _ => throw new InvalidOperationException($"Unknown model {model} for pricing.")
        };

        return new OpenAiPricingCalculator(inputCost, outputCost);
    }

    public static OpenAiPricingCalculator GetTextPricingCalculator(string model) {
        (var inputCost, var outputCost) = model switch {
            "gpt-4o" => (2.5, 10.0),
            "gpt-4o-mini" => (0.15, 0.60),
            _ => throw new InvalidOperationException($"Unknown model {model} for pricing.")
        };

        return new OpenAiPricingCalculator(inputCost, outputCost);
    }
}
