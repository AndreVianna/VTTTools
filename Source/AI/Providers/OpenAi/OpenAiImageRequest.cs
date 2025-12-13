namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiImageRequest(
    [property: JsonPropertyName("model")] string Model,
    [property: JsonPropertyName("prompt")] string Prompt,
    [property: JsonPropertyName("output_format")] string OutputFormat,
    [property: JsonPropertyName("size")] string Size,
    [property: JsonPropertyName("background")] string Background);