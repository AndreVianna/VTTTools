namespace VttTools.AssetImageManager.Domain.Images.Contracts;

/// <summary>
/// Abstraction for storing and retrieving VTT images in an 8-level hierarchical structure.
/// Hierarchy: images/{genre}/{category}/{type}/{subtype}/{letter}/{entity}/{variant}/files
/// Example: images/fantasy/creatures/monsters/humanoids/g/goblin/male-warrior-scimitar/top-down.png
/// </summary>
public interface IImageStore {
    /// <summary>
    /// Saves an image to the hierarchical structure.
    /// File name pattern: {imageType}.png (e.g., top-down.png, portrait.png)
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination (e.g., "male-warrior-scimitar").</param>
    /// <param name="imageData">PNG image bytes.</param>
    /// <param name="imageType">Semantic image type name (TopDown, Miniature, Photo, Portrait).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Full absolute path where the image was saved.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity, variant, or imageData is null.</exception>
    /// <exception cref="ArgumentException">Thrown when imageType is invalid.</exception>
    /// <exception cref="IOException">Thrown when file system operation fails.</exception>
    Task<string> SaveImageAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        byte[] imageData,
        string imageType,
        CancellationToken ct = default);

    /// <summary>
    /// Gets existing image types for a variant combination.
    /// Scans existing image files (top-down.png, miniature.png, etc.) and returns the list.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of existing image type names. Empty list if no images exist.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    Task<IReadOnlyList<string>> GetExistingImageTypesAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        CancellationToken ct = default);

    /// <summary>
    /// Saves metadata (JSON) for a variant combination.
    /// File name: metadata.json (contains prompt, creation timestamp, AI provider, etc.)
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <param name="metadataJson">JSON string containing metadata.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Full absolute path where metadata was saved.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity, variant, or metadataJson is null.</exception>
    /// <exception cref="ArgumentException">Thrown when metadataJson is empty.</exception>
    /// <exception cref="IOException">Thrown when file system operation fails.</exception>
    Task<string> SaveMetadataAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        string metadataJson,
        CancellationToken ct = default);

    /// <summary>
    /// Loads metadata (JSON) for a variant combination.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>JSON string if metadata.json exists; otherwise, null.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    Task<string?> LoadMetadataAsync(
        EntityDefinition entity,
        StructuralVariant variant,
        CancellationToken ct = default);

    /// <summary>
    /// Get lightweight summaries of all entities matching the filters.
    /// Used by: list command
    /// </summary>
    /// <param name="categoryFilter">Optional category filter (e.g., "creatures").</param>
    /// <param name="typeFilter">Optional type filter (e.g., "monsters").</param>
    /// <param name="subtypeFilter">Optional subtype filter (e.g., "humanoids").</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Read-only list of entity summaries. Empty list if no entities match.</returns>
    Task<IReadOnlyList<EntitySummary>> GetEntitySummariesAsync(
        string? categoryFilter = null,
        string? typeFilter = null,
        string? subtypeFilter = null,
        CancellationToken ct = default);

    /// <summary>
    /// Get detailed information about a specific entity.
    /// Used by: show command
    /// </summary>
    /// <param name="genre">Entity genre (e.g., "Fantasy", "Sci-Fi").</param>
    /// <param name="category">Entity category (e.g., "creatures").</param>
    /// <param name="type">Entity type (e.g., "monsters").</param>
    /// <param name="subtype">Entity subtype (e.g., "humanoids").</param>
    /// <param name="name">Entity name (e.g., "goblin").</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>EntityInfo if found; otherwise, null.</returns>
    Task<EntityInfo?> GetEntityInfoAsync(
        string genre,
        string category,
        string type,
        string subtype,
        string name,
        CancellationToken ct = default);

    /// <summary>
    /// Builds the directory path for a variant without creating directories or saving files.
    /// Used by: prepare command to create folder structure and determine .prompt file locations.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <returns>Full absolute directory path where images for this variant would be stored.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    string GetVariantDirectoryPath(EntityDefinition entity, StructuralVariant variant);
}
