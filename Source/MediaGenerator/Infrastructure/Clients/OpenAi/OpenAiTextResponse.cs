namespace VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

internal sealed record OpenAiTextResponse(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("object")] string? ObjectType,
    [property: JsonPropertyName("created_at")] long CreatedAt,
    [property: JsonPropertyName("status")] string? Status,
    [property: JsonPropertyName("error")] object? Error,
    [property: JsonPropertyName("model")] string? Model,
    [property: JsonPropertyName("output")] OpenAiOutputItem[]? Output,
    [property: JsonPropertyName("usage")] OpenAiUsage? Usage);