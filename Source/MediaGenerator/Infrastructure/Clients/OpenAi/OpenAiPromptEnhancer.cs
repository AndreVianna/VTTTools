namespace VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

public sealed class OpenAiPromptEnhancer(
    IHttpClientFactory httpClientFactory,
    IConfiguration config)
    : IPromptEnhancer {
    private readonly OpenAiHttpClientHelper _helper = new(httpClientFactory, config);

    public async Task<PromptEnhancerResponse> EnhancePromptAsync(
        string imageType,
        Asset entity,
        int tokenIndex,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();
        var model = GetModel();

        try {
            var request = BuildRequest(imageType, entity, model);
            var response = await SendRequestAsync(request, model, ct);
            return ProcessResponse(response, model, stopwatch.Elapsed);
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

    private string GetModel()
        => config["PromptEnhancer:Model"]
            ?? throw new InvalidOperationException("OpenAI model is not configured.");

    private static object BuildRequest(string imageType, Asset asset, string model)
        => new {
            model,
            instructions = BuildSystemPrompt(imageType, asset),
            input = BuildUserPrompt(asset),
        };

    private async Task<OpenAiTextResponse> SendRequestAsync(
        object request,
        string model,
        CancellationToken ct) {
        using var client = _helper.CreateAuthenticatedClient();
        var endpoint = _helper.GetEndpoint(model);
        var response = await OpenAiHttpClientHelper.PostAndDeserializeAsync<OpenAiTextResponse>(client, endpoint, request, ct);
        return response ?? throw new InvalidOperationException("OpenAI API returned null response");
    }

    private static PromptEnhancerResponse ProcessResponse(
        OpenAiTextResponse response,
        string model,
        TimeSpan duration) {
        if (response.Output is null || response.Output.Length == 0) {
            return CreateErrorResponse("OpenAI API returned empty response", duration);
        }

        var outputItem = response.Output[1];
        if (outputItem.Content is null || outputItem.Content.Length == 0) {
            return CreateErrorResponse("OpenAI API returned empty content", duration);
        }

        var text = outputItem.Content[0].Text ?? string.Empty;
        var cost = CalculateCost(response.Usage!, model);
        CostCalculation.LogCost(cost);

        return new(
                   Prompt: text,
                   IsSuccess: true,
                   TotalTokens: cost.TotalTokens,
                   TotalCost: cost.TotalCost,
                   Duration: duration);
    }

    private static CostCalculation CalculateCost(OpenAiUsage usage, string model) {
        var calculator = OpenAiHttpClientHelper.GetTextPricingCalculator(model);
        return calculator.Calculate(usage.InputTokens, usage.OutputTokens);
    }

    private static string BuildSystemPrompt(string imageType, Asset asset)
        => $"""
           You are an expert at creating image generation prompts for a high quality {asset.Classification.Kind} illustration.
           Your task in to create a detailed prompt that generates an image that captures all of the details described below."
           You MUST ensure that the image that the prompt describes is {ImageDescriptionFor(imageType, asset)} in a Virtual Tabletop Web Application.
           You MUST also ensure that the image does not contain any border, frame, text, watermark, signature, blurry, multiple subjects, duplicates, cropped edges, cropped parts, distorted shapes, and incorrect forms, body parts or perspective."
           The image MUST be a realistic color-pencil illustration, with vivid colors, good contrast, with focus on the {asset.Classification.Kind} described below."
           The output MUST be a simple text that will be immediately submitted to an image generator AI."
           It MUST not have any preamble or explanation or the result, only the prompt text tailored for image generation."
           Here is the {asset.Classification.Kind} description:
           """;

    private static string ImageDescriptionFor(string imageType, Asset asset)
        => imageType switch {
            "Token" => $"a bird's eye, top-down of the {asset.Classification.Kind}, with a transparent background to be seamless integrated into a virtual battlemap",
            "Portrait" => $"a portrait of the {asset.Classification.Kind}, displaying it in full view, with an image background that highlights the {BackgroundFor(asset)}, to be used as the {asset.Classification.Kind} display",
            _ => throw new ArgumentException($"Unknown image type: {imageType}", nameof(imageType)),
        };

    private static string BackgroundFor(Asset asset) => asset.Classification.Kind switch {
        AssetKind.Creature => $"{asset.Classification.Kind} in its natural environment",
        AssetKind.Character => $"{asset.Classification.Kind}'s background",
        _ => $"{asset.Classification.Kind}",
    };

    private static string BuildUserPrompt(Asset asset) {
        var sb = new StringBuilder();
        sb.AppendLine($"{asset.Name}; {BuildType(asset)}.");
        AppendAssetDescription(sb, asset);
        return sb.ToString();
    }

    private static void AppendAssetDescription(StringBuilder sb, Asset asset) {
        if (!string.IsNullOrWhiteSpace(asset.Description))
            sb.AppendLine($"The subject is described as {asset.Description}. ");
    }

    private static string BuildType(Asset entity)
        => string.IsNullOrWhiteSpace(entity.Classification.Type) ? ""
        : string.IsNullOrWhiteSpace(entity.Classification.Subtype) ? $" {entity.Classification.Type}"
        : $" {entity.Classification.Type} ({entity.Classification.Subtype})";

    private static PromptEnhancerResponse CreateErrorResponse(string errorMessage, TimeSpan duration)
        => new(
            Prompt: string.Empty,
            IsSuccess: false,
            ErrorMessage: errorMessage,
            Duration: duration);
}