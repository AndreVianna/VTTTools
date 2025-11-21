namespace VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;

public sealed class OpenAiPromptEnhancer(
    IHttpClientFactory httpClientFactory,
    IConfiguration config) : IPromptEnhancer {
    private readonly OpenAiHttpClientHelper _helper = new(httpClientFactory, config);

    public async Task<PromptEnhancerResponse> EnhancePromptAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        string imageType,
        CancellationToken ct = default) {
        var stopwatch = Stopwatch.StartNew();
        var model = GetModel();

        try {
            var request = BuildRequest(entity, variant, imageType, model);
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

    private object BuildRequest(
        EntryDefinition entity,
        StructuralVariant variant,
        string imageType,
        string model) => new {
            model,
            instructions = BuildSystemPrompt(entity, imageType),
            input = BuildUserPrompt(entity, variant, imageType),
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

        return new PromptEnhancerResponse(
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

    private string BuildSystemPrompt(EntryDefinition entity, string imageType) {
        var sb = new StringBuilder();
        sb.AppendLine($"You are an expert at creating image generation prompts for a high quality {entity.Genre} {entity.Category} illustration.");
        sb.AppendLine($"You MUST ensure that the image is {GetMainPrompt(imageType)}.");
        sb.AppendLine($"You MUST also ensure that the image does not contain {GetNegativePrompt(imageType)}.");
        sb.AppendLine("The output MUST be a simple text prompt to be immediatelly submitted to a image generation AI. It MUST not have any preamble or explanation or the result, only the prompt text tailored for image generation.");
        return sb.ToString();
    }

    private static string BuildUserPrompt(
        EntryDefinition entity,
        StructuralVariant variant,
        string imageType) {
        var sb = new StringBuilder();
        sb.AppendLine("Create a detailed prompt that generates an image that captures all of the following elements:");
        sb.AppendLine($"The image represents a{BuildDescription(entity, variant)} {entity.Name}. ");
        AppendPhysicalDescription(sb, entity);
        AppendDistinctiveFeatures(sb, entity);
        AppendMaterialOrEquipment(sb, entity, variant);
        AppendEnvironment(sb, entity, imageType);
        return sb.ToString();
    }

    private static void AppendPhysicalDescription(StringBuilder sb, EntryDefinition entity) {
        if (!string.IsNullOrWhiteSpace(entity.PhysicalDescription))
            sb.AppendLine($"The subject is described as {entity.PhysicalDescription}. ");
    }

    private static void AppendDistinctiveFeatures(StringBuilder sb, EntryDefinition entity) {
        if (!string.IsNullOrWhiteSpace(entity.DistinctiveFeatures))
            sb.AppendLine($"The subject has these characteristics: {entity.DistinctiveFeatures}. ");
    }

    private static void AppendMaterialOrEquipment(
        StringBuilder sb,
        EntryDefinition entity,
        StructuralVariant variant) {
        if (entity.Category == "Object") {
            if (!string.IsNullOrWhiteSpace(variant.Material) || !string.IsNullOrWhiteSpace(variant.Quality))
                sb.AppendLine($"The subject is made of{BuildMaterial(variant)}.");
        }
        else if (!string.IsNullOrWhiteSpace(variant.Equipment) || !string.IsNullOrWhiteSpace(variant.Vestment)) {
            sb.AppendLine($"The subject is{BuildEquipment(variant)}{BuildVestment(variant)}.");
        }
    }

    private static void AppendEnvironment(StringBuilder sb, EntryDefinition entity, string imageType) {
        if (imageType == ImageType.Portrait && !string.IsNullOrWhiteSpace(entity.Environment))
            sb.Append($"The subject is shown in {entity.Environment}.");
    }

    private static string BuildDescription(EntryDefinition entity, StructuralVariant variant)
        => Spaced(variant.Size) + Spaced(variant.Gender) + BuildType(entity);

    private static string BuildType(EntryDefinition entity)
        => string.IsNullOrWhiteSpace(entity.Type) ? ""
        : string.IsNullOrWhiteSpace(entity.Subtype) ? $" {entity.Type}"
        : $" {entity.Type} ({entity.Subtype})";

    private static string BuildEquipment(StructuralVariant variant)
        => string.IsNullOrWhiteSpace(variant.Equipment) ? ""
        : $" holding {variant.Equipment}";

    private static string BuildVestment(StructuralVariant variant)
        => string.IsNullOrWhiteSpace(variant.Vestment) ? ""
        : $" wearing {variant.Vestment}";

    private static string BuildMaterial(StructuralVariant variant)
        => string.IsNullOrWhiteSpace(variant.Material) ? ""
        : string.IsNullOrWhiteSpace(variant.Quality) ? $" {variant.Material}"
        : $" {variant.Quality} {variant.Material}";

    private static string Spaced(string? value)
        => string.IsNullOrWhiteSpace(value) ? "" : $" {value}";

    private string GetMainPrompt(string imageType)
        => config[$"Images:{imageType}:MainPrompt"]
            ?? throw new InvalidOperationException($"{imageType} main prompt not configured.");

    private string GetNegativePrompt(string imageType) {
        var specificNegativesPrompt = config[$"Images:{imageType}:NegativePrompt"] ?? string.Empty;
        return string.IsNullOrWhiteSpace(specificNegativesPrompt)
            ? _genericNegativePrompt
            : $"{_genericNegativePrompt}, {specificNegativesPrompt}";
    }

    private static PromptEnhancerResponse CreateErrorResponse(string errorMessage, TimeSpan duration)
        => new(
            Prompt: string.Empty,
            IsSuccess: false,
            ErrorMessage: errorMessage,
            Duration: duration);

    private const string _genericNegativePrompt = "border, frame, text, watermark, signature, blurry, low quality, cropped edges, multiple subjects, duplicates";
}

internal sealed record OpenAiTextResponse(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("object")] string? ObjectType,
    [property: JsonPropertyName("created_at")] long CreatedAt,
    [property: JsonPropertyName("status")] string? Status,
    [property: JsonPropertyName("error")] object? Error,
    [property: JsonPropertyName("model")] string? Model,
    [property: JsonPropertyName("output")] OpenAiOutputItem[]? Output,
    [property: JsonPropertyName("usage")] OpenAiUsage? Usage);

internal sealed record OpenAiOutputItem(
    [property: JsonPropertyName("type")] string? Type,
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("status")] string? Status,
    [property: JsonPropertyName("role")] string? Role,
    [property: JsonPropertyName("content")] OpenAiContentItem[]? Content);

internal sealed record OpenAiContentItem(
    [property: JsonPropertyName("type")] string? Type,
    [property: JsonPropertyName("text")] string? Text,
    [property: JsonPropertyName("annotations")] object[]? Annotations);
