namespace VttTools.AI.Providers.OpenAi;

public sealed class OpenAiTextProvider(
    IHttpClientFactory httpClientFactory,
    IOptionsSnapshot<AiOptions> options,
    ILogger<OpenAiTextProvider> logger) : ITextProvider {
    private readonly OpenAiHttpHelper _helper = new(httpClientFactory, options);

    public string Name => "OpenAI";

    public async Task<Result<TextGenerationResponse>> GenerateAsync(
        TextGenerationData data,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        try {
            var model = data.Model
                ?? throw new InvalidOperationException("Model must be specified for text generation.");

            logger.LogDebug("Starting OpenAI text generation with model {Model}", model);

            var apiRequest = CreateTextRequest(model, data);
            var endpoint = OpenAiHttpHelper.GetEndpoint(model);

            using var client = _helper.CreateAuthenticatedClient();
            var response = await OpenAiHttpHelper.PostAndDeserializeAsync<OpenAiTextResponse>(client, endpoint, apiRequest, ct);

            if (!IsValidResponse(response)) {
                logger.LogWarning("OpenAI API returned empty or invalid response");
                return Result.Failure<TextGenerationResponse>(null!, "OpenAI API returned empty response");
            }

            var generatedText = response!.Choices![0].Message!.Content;
            var calculator = OpenAiHttpHelper.GetTextPricingCalculator(model);
            var cost = calculator.Calculate(
                response.Usage!.InputTokens,
                response.Usage!.OutputTokens);

            stopwatch.Stop();
            logger.LogInformation(
                "OpenAI text generation completed in {Duration}ms - Tokens: {TotalTokens}, Cost: ${TotalCost:F4}",
                stopwatch.ElapsedMilliseconds,
                cost.TotalTokens,
                cost.TotalCost);

            return Result.Success(new TextGenerationResponse {
                GeneratedText = generatedText,
                ContentType = data.ContentType,
                Provider = data.Provider!,
                Model = model,
                InputTokens = cost.InputTokens,
                OutputTokens = cost.OutputTokens,
                Cost = (decimal)cost.TotalCost,
                Elapsed = stopwatch.Elapsed,
            });
        }
        catch (HttpRequestException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Network error during OpenAI text generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure<TextGenerationResponse>(null!, $"Network error: {ex.Message}");
        }
        catch (JsonException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "JSON deserialization error during OpenAI text generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure<TextGenerationResponse>(null!, $"JSON deserialization error: {ex.Message}");
        }
        catch (Exception ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Unexpected error during OpenAI text generation after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure<TextGenerationResponse>(null!, $"Unexpected error: {ex.Message}");
        }
    }

    private static OpenAiTextRequest CreateTextRequest(string model, TextGenerationData data) {
        var messages = new List<OpenAiMessage>();

        if (!string.IsNullOrWhiteSpace(data.SystemPrompt)) {
            messages.Add(new OpenAiMessage(Role: "system", Content: data.SystemPrompt));
        }

        messages.Add(new OpenAiMessage(Role: "user", Content: data.Prompt));

        return new OpenAiTextRequest(
            Model: model,
            Messages: [.. messages],
            MaxTokens: data.MaxTokens,
            Temperature: data.Temperature);
    }

    private static bool IsValidResponse(OpenAiTextResponse? response) {
        if (response is null || response.Choices?.Length == 0) {
            return false;
        }

        var message = response.Choices![0].Message;
        return message is not null && !string.IsNullOrEmpty(message.Content);
    }
}