namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiDataItem(
    [property: JsonPropertyName("b64_json")] string Content);