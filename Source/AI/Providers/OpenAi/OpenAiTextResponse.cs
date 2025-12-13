namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiTextResponse(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("choices")] OpenAiChoice[]? Choices,
    [property: JsonPropertyName("usage")] OpenAiUsage? Usage);