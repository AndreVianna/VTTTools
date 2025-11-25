namespace VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;

internal sealed record OpenAiContentItem(
    [property: JsonPropertyName("type")] string? Type,
    [property: JsonPropertyName("text")] string? Text,
    [property: JsonPropertyName("annotations")] object[]? Annotations);
