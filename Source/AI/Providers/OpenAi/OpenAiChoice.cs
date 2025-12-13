namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiChoice(
    [property: JsonPropertyName("message")] OpenAiMessage? Message,
    [property: JsonPropertyName("finish_reason")] string? FinishReason);