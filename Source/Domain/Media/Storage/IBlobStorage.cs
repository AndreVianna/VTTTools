namespace VttTools.Media.Storage;

public interface IBlobStorage {
    /// <summary>
    /// Save original uploaded file to originals/{extension}/{basePath}
    /// </summary>
    Task<Result<string>> SaveOriginalAsync(string basePath, string fileName, Stream content, CancellationToken ct = default);

    /// <summary>
    /// Save primary (converted) file to resources/{extension}/{basePath}
    /// </summary>
    Task<Result<string>> SavePrimaryAsync(string basePath, Stream content, string contentType, CancellationToken ct = default);

    /// <summary>
    /// Save placeholder (first frame PNG) to placeholders/{basePath}
    /// </summary>
    Task<Result<string>> SavePlaceholderAsync(string basePath, byte[] placeholder, CancellationToken ct = default);

    /// <summary>
    /// Save thumbnail (256x256 PNG) to thumbnails/{basePath}
    /// </summary>
    Task<Result<string>> SaveThumbnailAsync(string basePath, byte[] thumbnail, CancellationToken ct = default);

    /// <summary>
    /// Get original file from originals/{extension}/{basePath}
    /// </summary>
    Task<ResourceDownloadResult?> GetOriginalAsync(string basePath, string fileName, CancellationToken ct = default);

    /// <summary>
    /// Get primary file from resources/{extension}/{basePath}
    /// </summary>
    Task<ResourceDownloadResult?> GetPrimaryAsync(string basePath, string contentType, CancellationToken ct = default);

    /// <summary>
    /// Remove all artifacts for a resource (original, primary, placeholder, thumbnail)
    /// </summary>
    Task<Result> RemoveAsync(string basePath, string fileName, string contentType, CancellationToken ct = default);

    /// <summary>
    /// Get thumbnail from thumbnails/{basePath}
    /// </summary>
    Task<ResourceDownloadResult?> GetThumbnailAsync(string basePath, CancellationToken ct = default);

    /// <summary>
    /// Get primary resource with fallback to placeholder if primary is not available.
    /// Tries to get the primary resource first, then falls back to placeholder.
    /// </summary>
    /// <param name="basePath">The base path in format "{suffix}/{guid}" (e.g., "a1b2/01939456789abcdef01234567890a1b2")</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>ResourceDownloadResult if primary or placeholder exists, null if neither exists</returns>
    Task<ResourceDownloadResult?> GetResourceWithFallbackAsync(string basePath, CancellationToken ct = default);
}
