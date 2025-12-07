namespace VttTools.AI.Providers.OpenAi;

public sealed class OpenAiPromptProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<OpenAiPromptProvider> logger) : IPromptProvider {
    private readonly OpenAiHttpHelper _helper = new(httpClientFactory, configuration);

    public AiProviderType ProviderType => AiProviderType.OpenAi;

    public async Task<Result<string>> EnhanceAsync(
        PromptEnhancementRequest request,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();

        try {
            var model = request.Model ?? configuration["AI:Providers:OpenAI:Models:Prompt"]
                ?? throw new InvalidOperationException("OpenAI prompt model not configured.");

            logger.LogDebug("Starting OpenAI prompt enhancement with model {Model}", model);

            var apiRequest = CreateTextRequest(model, request);
            var endpoint = _helper.GetEndpoint(model);

            using var client = _helper.CreateAuthenticatedClient();
            var response = await OpenAiHttpHelper.PostAndDeserializeAsync<OpenAiTextResponse>(client, endpoint, apiRequest, ct);

            if (!IsValidResponse(response)) {
                logger.LogWarning("OpenAI API returned empty or invalid response");
                return Result.Failure("OpenAI API returned empty response");
            }

            var enhancedPrompt = response!.Choices![0].Message!.Content;
            var calculator = OpenAiHttpHelper.GetTextPricingCalculator(model);
            var cost = calculator.Calculate(
                response.Usage!.InputTokens,
                response.Usage!.OutputTokens);

            stopwatch.Stop();
            logger.LogInformation(
                "OpenAI prompt enhancement completed in {Duration}ms - Tokens: {TotalTokens}, Cost: ${TotalCost:F4}",
                stopwatch.ElapsedMilliseconds,
                cost.TotalTokens,
                cost.TotalCost);

            return Result.Success(enhancedPrompt);
        }
        catch (HttpRequestException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Network error during OpenAI prompt enhancement after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Network error: {ex.Message}");
        }
        catch (JsonException ex) {
            stopwatch.Stop();
            logger.LogError(ex, "JSON deserialization error during OpenAI prompt enhancement after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"JSON deserialization error: {ex.Message}");
        }
        catch (Exception ex) {
            stopwatch.Stop();
            logger.LogError(ex, "Unexpected error during OpenAI prompt enhancement after {Duration}ms", stopwatch.ElapsedMilliseconds);
            return Result.Failure($"Unexpected error: {ex.Message}");
        }
    }

    private static OpenAiTextRequest CreateTextRequest(string model, PromptEnhancementRequest request) {
        var messages = new List<OpenAiMessage> {
            new(Role: "system", Content: BuildSystemPrompt(request.Style)),
            new(Role: "user", Content: BuildUserPrompt(request))
        };

        return new OpenAiTextRequest(
            Model: model,
            Messages: [.. messages]);
    }

    private static string BuildSystemPrompt(string? style) {
        const string basePrompt = """
            You are an AI prompt engineer specializing in image generation. Your task is to enhance
            user prompts to produce better results with AI image generators like DALL-E, Stable Diffusion,
            and Midjourney.

            When enhancing a prompt:
            1. Add descriptive details about style, lighting, composition, and mood
            2. Include technical photography/art terms where appropriate
            3. Maintain the original intent and subject matter
            4. Keep the enhanced prompt focused and coherent
            5. If context or style hints are provided, incorporate them naturally

            Output ONLY the enhanced prompt, nothing else.
            """;

        return !string.IsNullOrWhiteSpace(style) ? $"{basePrompt}\n\nPreferred style: {style}" : basePrompt;
    }

    private static string BuildUserPrompt(PromptEnhancementRequest request) => string.IsNullOrWhiteSpace(request.Context)
            ? request.Prompt
            : $"""
            Base prompt: {request.Prompt}

            Additional context: {request.Context}
            """;

    private static bool IsValidResponse(OpenAiTextResponse? response) {
        if (response is null || response.Choices?.Length == 0) {
            return false;
        }

        var message = response.Choices![0].Message;
        return message is not null && !string.IsNullOrEmpty(message.Content);
    }
}
