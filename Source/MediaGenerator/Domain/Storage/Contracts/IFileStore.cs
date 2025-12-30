namespace VttTools.MediaGenerator.Domain.Storage.Contracts;

/// <summary>
/// Abstraction for storing and retrieving VTT files (images and prompts) in an 8-level hierarchical structure.
/// Hierarchy: files/{kind}/{category}/{type}/{subtype}/{asset}/{variant}/files
/// Example: files/creature/monster/humanoid/goblin/male-warrior-scimitar/top-down.png
/// </summary>
public interface IFileStore {
    /// <summary>
    /// Load assets from a JSON file.
    /// </summary>
    /// <param name="path">JSON file path</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of assets in the file.</returns>
    Task<List<Asset>> LoadAssetsAsync(string path, CancellationToken ct = default);

    /// <summary>
    /// check if entry has any image file.
    /// </summary>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>Full true if entry has any image file.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    bool HasImageFiles(Asset asset, int variantIndex = 0);

    /// <summary>
    /// check if image file exists.
    /// </summary>
    /// <param name="imageType">Semantic image type name (Token, Token, DefaultDisplay).</param>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>Full true if image file exists.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    bool ImageFileExists(string imageType, Asset asset, int variantIndex = 0);

    /// <summary>
    /// Gets existing image files for an entry variant combination.
    /// Scans existing image files (top-down.png, portrait.png, etc.) and returns the list.
    /// </summary>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>List of existing image files names. Empty list if no images exist.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    IReadOnlyList<string> GetExistingImageFiles(Asset asset, int variantIndex = 0);

    /// <summary>
    /// Search for a prompt files for an entry variant combination and returns the file name if found.
    /// </summary>
    /// <param name="imageType">Semantic image type name (Token, Token, DefaultDisplay).</param>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>  </returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    string? FindImageFile(string imageType, Asset asset, int variantIndex = 0);

    /// <summary>
    /// Saves an image to the hierarchical structure.
    /// File name pattern: {imageType}.png (e.g., top-down.png, portrait.png)
    /// </summary>
    /// <param name="imageType">Semantic image type name (Token, Token, DefaultDisplay).</param>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <param name="content">PNG image bytes.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Full absolute path where the image was saved.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset, variant, or content is null.</exception>
    /// <exception cref="ArgumentException">Thrown when imageType is invalid.</exception>
    /// <exception cref="IOException">Thrown when file system operation fails.</exception>
    Task<string> SaveImageAsync(
        string imageType,
        Asset asset,
        int variantIndex,
        byte[] content,
        CancellationToken ct = default);

    /// <summary>
    /// check if entry has any prompt file.
    /// </summary>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>Full true if entry has any image file.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    bool HasPromptFiles(Asset asset, int variantIndex = 0);

    /// <summary>
    /// check if prompt file exists.
    /// </summary>
    /// <param name="imageType">Semantic image type name (Token, Token, DefaultDisplay).</param>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>Full true if prompt file exists.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    bool PromptFileExists(string imageType, Asset asset, int variantIndex = 0);

    /// <summary>
    /// Search for a prompt files for an entry variant combination and returns the file name if found.
    /// </summary>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <param name="imageType">Semantic image type name (Token, Token, DefaultDisplay).</param>
    /// <returns>  </returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    string? FindPromptFile(string imageType, Asset asset, int variantIndex = 0);

    /// <summary>
    /// Gets existing prompt files for an entry variant combination.
    /// Scans existing prompt files (top-down.md, portrait.md, etc.) and returns the list.
    /// </summary>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <returns>List of existing prompt files names. Empty list if no images exist.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset or variant is null.</exception>
    IReadOnlyList<string> GetExistingPromptFiles(Asset asset, int variantIndex = 0);

    /// <summary>
    /// Saves an enhanced prompt to the hierarchical structure.
    /// File name pattern: {imageType}.prompt (e.g., top-down.prompt, portrait.prompt)
    /// </summary>
    /// <param name="imageType">Semantic image type name (Token, Token, DefaultDisplay).</param>
    /// <param name="asset">Asset definition containing category, type, subtype, and name.</param>
    /// <param name="variantIndex">Index of the asset variant.</param>
    /// <param name="prompt">Prompt text.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Full absolute path where the image was saved.</returns>
    /// <exception cref="ArgumentNullException">Thrown when asset, variant, or content is null.</exception>
    /// <exception cref="ArgumentException">Thrown when imageType is invalid.</exception>
    /// <exception cref="IOException">Thrown when file system operation fails.</exception>
    Task<string> SavePromptAsync(
        string imageType,
        Asset asset,
        int variantIndex,
        string prompt,
        CancellationToken ct = default);

    /// <summary>
    /// Get lightweight summaries of all entities matching the filters.
    /// Used by: list command
    /// </summary>
    /// <param name="kindFilter">Optional kind filter (e.g., "creatures").</param>
    /// <param name="categoryFilter">Optional category filter (e.g., "creatures").</param>
    /// <param name="typeFilter">Optional type filter (e.g., "monsters").</param>
    /// <param name="subtypeFilter">Optional subtype filter (e.g., "humanoids").</param>
    /// <returns>Read-only list of asset summaries. Empty list if no entities match.</returns>
    IReadOnlyList<Asset> GetAssets(
        AssetKind? kindFilter = null,
        string? categoryFilter = null,
        string? typeFilter = null,
        string? subtypeFilter = null,
        string? nameFilter = null);

    /// <summary>
    /// Get detailed information about a specific asset.
    /// Used by: show command
    /// </summary>
    /// <param name="name">Asset name (e.g., "goblin").</param>
    /// <returns>AssetInfo if found; otherwise, null.</returns>
    Asset? FindAsset(string name);
}