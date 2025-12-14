namespace VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

public sealed class OpenAiHttpClientHelper(IHttpClientFactory httpClientFactory, IConfiguration config) {
    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public HttpClient CreateAuthenticatedClient() {
        var client = httpClientFactory.CreateClient();
        var baseUrl = config["Providers:OpenAI:BaseUrl"]
            ?? throw new InvalidOperationException("OpenAI API base url not configured.");
        client.BaseAddress = new Uri(baseUrl);

        var apiKey = config["Providers:OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key is not configured.");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Accept", "application/json");

        return client;
    }

    public string GetEndpoint(string model)
        => config[$"Providers:OpenAI:{model}"]
            ?? throw new InvalidOperationException($"OpenAI API {model} endpoint is not configured.");

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

    public static OpenAiPricingCalculator GetTextPricingCalculator(string model) {
        (var inputCost, var outputCost) = model switch {
            "gpt-5.1" => (1.25, 10.0),
            "gpt-5" => (1.25, 10.0),
            "gpt-5-mini" => (0.25, 2.0),
            "gpt-5-nano" => (0.05, 0.40),
            _ => throw new InvalidOperationException($"Unknown model {model} for pricing.")
        };

        return new OpenAiPricingCalculator(inputCost, outputCost);
    }

    public static OpenAiPricingCalculator GetImagePricingCalculator(string model) {
        (var inputCost, var outputCost) = model switch {
            "gpt-image-1" => (10.0, 40.0),
            "gpt-image-1-mini" => (2.5, 8.0),
            _ => throw new InvalidOperationException($"Unknown model {model} for pricing.")
        };

        return new OpenAiPricingCalculator(inputCost, outputCost);
    }
}

public sealed record OpenAiPricingCalculator(double InputCostPerM, double OutputCostPerM) {
    public CostCalculation Calculate(int inputTokens, int outputTokens) {
        var inputCost = InputCostPerM * inputTokens / 1000000.0;
        var outputCost = OutputCostPerM * outputTokens / 1000000.0;
        var totalCost = inputCost + outputCost;
        var totalTokens = inputTokens + outputTokens;

        return new CostCalculation(inputTokens, inputCost, outputTokens, outputCost, totalTokens, totalCost);
    }
}

public sealed record CostCalculation(
    int InputTokens,
    double InputCost,
    int OutputTokens,
    double OutputCost,
    int TotalTokens,
    double TotalCost) {
    public static void LogCost(CostCalculation cost)
        => ConsoleOutput.WriteCost(
            cost.InputTokens,
            cost.InputCost,
            cost.OutputTokens,
            cost.OutputCost,
            cost.TotalTokens,
            cost.TotalCost);
}