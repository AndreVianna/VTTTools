namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiTextRequest(
    [property: JsonPropertyName("model")] string Model,
    [property: JsonPropertyName("messages")] OpenAiMessage[] Messages,
    [property: JsonPropertyName("max_completion_tokens")] int? MaxTokens = null,
    [property: JsonPropertyName("temperature")] double? Temperature = null);