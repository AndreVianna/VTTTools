namespace VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;

internal sealed record OpenAiOutputItem(
    [property: JsonPropertyName("type")] string? Type,
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("status")] string? Status,
    [property: JsonPropertyName("role")] string? Role,
    [property: JsonPropertyName("content")] OpenAiContentItem[]? Content);
