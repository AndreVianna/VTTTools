namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiImageResponse(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("data")] OpenAiDataItem[]? Data,
    [property: JsonPropertyName("usage")] OpenAiUsage? Usage);