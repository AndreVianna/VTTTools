namespace VttTools.AI.ApiContracts;

/// <summary>
/// Request for generating raw image bytes without side effects.
/// Used for service-to-service calls where the caller handles storage.
/// </summary>
public sealed record GenerateImageBytesRequest
    : Request {
    /// <summary>
    /// The content type (e.g., ImagePortrait, ImageToken) that determines generation parameters.
    /// </summary>
    public required GeneratedContentType ContentType { get; init; }

    /// <summary>
    /// The prompt describing the image to generate.
    /// </summary>
    public required string Prompt { get; init; }

    /// <summary>
    /// Optional negative prompt to exclude unwanted elements.
    /// </summary>
    public string? NegativePrompt { get; init; }

    /// <summary>
    /// Optional AI provider to use (e.g., "openai", "stability").
    /// </summary>
    public string? Provider { get; init; }

    /// <summary>
    /// Optional model to use (e.g., "dall-e-3", "stable-diffusion-xl").
    /// </summary>
    public string? Model { get; init; }

    /// <summary>
    /// Aspect ratio for the generated image (default: "1:1").
    /// </summary>
    public string AspectRatio { get; init; } = "1:1";

    /// <summary>
    /// Optional explicit width in pixels.
    /// </summary>
    public int? Width { get; init; }

    /// <summary>
    /// Optional explicit height in pixels.
    /// </summary>
    public int? Height { get; init; }

    /// <summary>
    /// Optional style preset for the generation.
    /// </summary>
    public string? Style { get; init; }
}
