namespace VttTools.TokenManager.Infrastructure.Stability;

/// <summary>
/// Defines the contract for interacting with the Stability AI image generation API.
/// </summary>
public interface IStabilityClient {
    /// <summary>
    /// Generates a PNG image from the specified text prompt using Stability AI's text-to-image engine.
    /// </summary>
    /// <param name="prompt">The text description of the image to generate.</param>
    /// <param name="negativePrompt">Optional text describing what should NOT appear in the image.</param>
    /// <param name="aspectRatio">The aspect ratio for the generated image (e.g., "1:1", "16:9", "9:16"). Defaults to "1:1".</param>
    /// <param name="ct">Cancellation token to cancel the asynchronous operation.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the generated image as a PNG byte array.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the Stability API returns an error or the response is invalid.</exception>
    Task<byte[]> GeneratePngAsync(string prompt, string? negativePrompt = null, string aspectRatio = "1:1", CancellationToken ct = default);
}
