namespace VttTools.AI.ApiContracts;

/// <summary>
/// Response containing raw image bytes and generation metadata.
/// Used for service-to-service calls where the caller handles storage.
/// </summary>
public sealed record GenerateImageBytesResponse
    : Response {
    /// <summary>
    /// Base64-encoded image data.
    /// </summary>
    public required string ImageDataBase64 { get; init; }

    /// <summary>
    /// The MIME content type of the image (e.g., "image/png").
    /// </summary>
    public required string ContentType { get; init; }

    /// <summary>
    /// The width of the generated image in pixels.
    /// </summary>
    public int Width { get; init; }

    /// <summary>
    /// The height of the generated image in pixels.
    /// </summary>
    public int Height { get; init; }

    /// <summary>
    /// Number of input tokens consumed (for cost tracking).
    /// </summary>
    public int InputTokens { get; init; }

    /// <summary>
    /// Number of output tokens consumed (for cost tracking).
    /// </summary>
    public int OutputTokens { get; init; }

    /// <summary>
    /// Estimated cost of the generation.
    /// </summary>
    public decimal Cost { get; init; }

    /// <summary>
    /// Time taken to generate the image.
    /// </summary>
    public TimeSpan Elapsed { get; init; }
}
