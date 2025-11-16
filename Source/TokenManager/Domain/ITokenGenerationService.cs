namespace VttTools.TokenManager.Domain;

/// <summary>
/// Service for generating token images from entity definitions using AI image generation.
/// </summary>
public interface ITokenGenerationService {
    /// <summary>
    /// Generates a token image variant for the specified entity.
    /// </summary>
    /// <param name="entity">The entity definition containing metadata for token generation.</param>
    /// <param name="variantIndex">The zero-based index of the variant being generated.</param>
    /// <param name="ct">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous generation operation.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="entity"/> or <paramref name="engineId"/> is null.</exception>
    /// <exception cref="ArgumentOutOfRangeException">Thrown when <paramref name="variantIndex"/> is negative.</exception>
    Task GenerateAsync(TokenEntity entity, int variantIndex, CancellationToken ct = default);
}
