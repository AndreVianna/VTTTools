namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiImageRequest(
    [property: JsonPropertyName("model")] string Model,
    [property: JsonPropertyName("prompt")] string Prompt,
    [property: JsonPropertyName("output_format")] string OutputFormat,
    [property: JsonPropertyName("size")] string Size,
    [property: JsonPropertyName("background")] string Background);

internal sealed record OpenAiImageResponse(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("data")] OpenAiDataItem[]? Data,
    [property: JsonPropertyName("usage")] OpenAiUsage? Usage);

internal sealed record OpenAiDataItem(
    [property: JsonPropertyName("b64_json")] string Content);

internal sealed record OpenAiUsage(
    [property: JsonPropertyName("input_tokens")] int InputTokens,
    [property: JsonPropertyName("output_tokens")] int OutputTokens,
    [property: JsonPropertyName("total_tokens")] int TotalTokens);

internal sealed record CostCalculation(
    int InputTokens,
    double InputCost,
    int OutputTokens,
    double OutputCost,
    int TotalTokens,
    double TotalCost);

internal sealed record OpenAiPricingCalculator(double InputCostPerM, double OutputCostPerM) {
    public CostCalculation Calculate(int inputTokens, int outputTokens) {
        var inputCost = InputCostPerM * inputTokens / 1000000.0;
        var outputCost = OutputCostPerM * outputTokens / 1000000.0;
        var totalCost = inputCost + outputCost;
        var totalTokens = inputTokens + outputTokens;

        return new CostCalculation(inputTokens, inputCost, outputTokens, outputCost, totalTokens, totalCost);
    }
}

internal sealed record OpenAiTextRequest(
    [property: JsonPropertyName("model")] string Model,
    [property: JsonPropertyName("messages")] OpenAiMessage[] Messages);

internal sealed record OpenAiMessage(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content);

internal sealed record OpenAiTextResponse(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("choices")] OpenAiChoice[]? Choices,
    [property: JsonPropertyName("usage")] OpenAiUsage? Usage);

internal sealed record OpenAiChoice(
    [property: JsonPropertyName("message")] OpenAiMessage? Message,
    [property: JsonPropertyName("finish_reason")] string? FinishReason);
