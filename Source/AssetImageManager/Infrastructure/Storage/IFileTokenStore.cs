namespace VttTools.AssetImageManager.Infrastructure.Storage;

/// <summary>
/// Provides file-based storage operations for token metadata and image variants.
/// </summary>
public interface IFileTokenStore {
    /// <summary>
    /// Enumerates all tokens stored in the file system.
    /// </summary>
    /// <returns>A collection of tuples containing the folder path and metadata for each token.</returns>
    IEnumerable<(string Folder, TokenMetadata Metadata)> EnumerateTokens();

    /// <summary>
    /// Loads the metadata for a specific token entity.
    /// </summary>
    /// <param name="entityId">The entity ID or slug to load metadata for.</param>
    /// <param name="ct">Cancellation token to cancel the operation.</param>
    /// <returns>A task representing the asynchronous load operation. The task result contains the token metadata if found; otherwise, null.</returns>
    Task<TokenMetadata?> LoadMetadataAsync(string entityId, CancellationToken ct = default);

    /// <summary>
    /// Saves a token variant with its metadata and image data to the file system.
    /// </summary>
    /// <param name="metadata">The metadata for the token variant.</param>
    /// <param name="imageBytes">The PNG image data for the variant.</param>
    /// <param name="variantIndex">The index number of the variant to save.</param>
    /// <param name="ct">Cancellation token to cancel the operation.</param>
    /// <returns>A task representing the asynchronous save operation.</returns>
    Task SaveVariantAsync(
        TokenMetadata metadata,
        byte[] imageBytes,
        int variantIndex,
        CancellationToken ct = default);
}
