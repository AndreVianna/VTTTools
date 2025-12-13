namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiMessage(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content);