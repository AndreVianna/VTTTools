namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiUsage(
    [property: JsonPropertyName("input_tokens")] int InputTokens,
    [property: JsonPropertyName("output_tokens")] int OutputTokens,
    [property: JsonPropertyName("total_tokens")] int TotalTokens);