namespace VttTools.Media.Ingest.Clients;

/// <summary>
/// Client for calling the AI API to generate images.
/// </summary>
public interface IAiGenerationClient {
    /// <summary>
    /// Generate raw image bytes using AI.
    /// </summary>
    /// <param name="prompt">The prompt for image generation.</param>
    /// <param name="contentType">The type of content (portrait or token).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Result with image data and metadata, or failure.</returns>
    Task<Result<AiGenerationResult>> GenerateImageBytesAsync(
        string prompt,
        GeneratedContentType contentType,
        CancellationToken ct = default);
}

/// <summary>
/// Result of AI image generation.
/// </summary>
public sealed record AiGenerationResult {
    /// <summary>
    /// The generated image data.
    /// </summary>
    public required byte[] ImageData { get; init; }

    /// <summary>
    /// The MIME content type.
    /// </summary>
    public required string ContentType { get; init; }

    /// <summary>
    /// Width of the generated image.
    /// </summary>
    public int Width { get; init; }

    /// <summary>
    /// Height of the generated image.
    /// </summary>
    public int Height { get; init; }

    /// <summary>
    /// Cost of the generation.
    /// </summary>
    public decimal Cost { get; init; }

    /// <summary>
    /// Time taken to generate.
    /// </summary>
    public TimeSpan Elapsed { get; init; }
}
