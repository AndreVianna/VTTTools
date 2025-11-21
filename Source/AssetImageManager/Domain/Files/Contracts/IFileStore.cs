namespace VttTools.AssetImageManager.Domain.Files.Contracts;

/// <summary>
/// Abstraction for storing and retrieving VTT files (images and prompts) in an 8-level hierarchical structure.
/// Hierarchy: files/{genre}/{category}/{type}/{subtype}/{letter}/{entity}/{variant}/files
/// Example: files/fantasy/creatures/monsters/humanoids/g/goblin/male-warrior-scimitar/top-down.png
/// </summary>
public interface IFileStore {
    /// <summary>
    /// check if entry has any image file.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <returns>Full true if entry has any image file.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    bool HasImageFiles(EntryDefinition entity, StructuralVariant variant);

    /// <summary>
    /// check if image file exists.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <returns>Full true if image file exists.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    bool ImageFileExists(EntryDefinition entity, StructuralVariant variant, string imageType);

    /// <summary>
    /// Gets existing image files for an entry variant combination.
    /// Scans existing image files (top-down.png, portrait.png, etc.) and returns the list.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <returns>List of existing image files names. Empty list if no images exist.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    IReadOnlyList<string> GetExistingImageFiles(EntryDefinition entity, StructuralVariant variant);

    /// <summary>
    /// Search for a prompt files for an entry variant combination and returns the file name if found.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <param name="imageType">Semantic image type name (TopDown, Photo, Portrait).</param>
    /// <returns>  </returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    string? FindImageFile(EntryDefinition entity, StructuralVariant variant, string imageType);

    /// <summary>
    /// Saves an image to the hierarchical structure.
    /// File name pattern: {imageType}.png (e.g., top-down.png, portrait.png)
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination (e.g., "male-warrior-scimitar").</param>
    /// <param name="imageData">PNG image bytes.</param>
    /// <param name="imageType">Semantic image type name (TopDown, Photo, Portrait).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Full absolute path where the image was saved.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity, variant, or imageData is null.</exception>
    /// <exception cref="ArgumentException">Thrown when imageType is invalid.</exception>
    /// <exception cref="IOException">Thrown when file system operation fails.</exception>
    Task<string> SaveImageAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        byte[] imageData,
        string imageType,
        CancellationToken ct = default);

    /// <summary>
    /// check if entry has any prompt file.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <returns>Full true if entry has any image file.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    bool HasPromptFiles(EntryDefinition entity, StructuralVariant variant);

    /// <summary>
    /// check if prompt file exists.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <param name="imageType">Semantic image type name (TopDown, Photo, Portrait).</param>
    /// <returns>Full true if prompt file exists.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    bool PromptFileExists(EntryDefinition entity, StructuralVariant variant, string imageType);

    /// <summary>
    /// Search for a prompt files for an entry variant combination and returns the file name if found.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <param name="imageType">Semantic image type name (TopDown, Photo, Portrait).</param>
    /// <returns>  </returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    string? FindPromptFile(EntryDefinition entity, StructuralVariant variant, string imageType);

    /// <summary>
    /// Gets existing prompt files for an entry variant combination.
    /// Scans existing prompt files (top-down.md, portrait.md, etc.) and returns the list.
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination.</param>
    /// <returns>List of existing prompt files names. Empty list if no images exist.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity or variant is null.</exception>
    IReadOnlyList<string> GetExistingPromptFiles(
        EntryDefinition entity,
        StructuralVariant variant);

    /// <summary>
    /// Saves an enhanced prompt to the hierarchical structure.
    /// File name pattern: {imageType}.prompt (e.g., top-down.prompt, portrait.prompt)
    /// </summary>
    /// <param name="entity">Entity definition containing category, type, subtype, and name.</param>
    /// <param name="variant">Structural variant defining the combination (e.g., "male-warrior-scimitar").</param>
    /// <param name="prompt">Prompt text.</param>
    /// <param name="imageType">Semantic image type name (TopDown, Photo, Portrait).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Full absolute path where the image was saved.</returns>
    /// <exception cref="ArgumentNullException">Thrown when entity, variant, or imageData is null.</exception>
    /// <exception cref="ArgumentException">Thrown when imageType is invalid.</exception>
    /// <exception cref="IOException">Thrown when file system operation fails.</exception>
    Task<string> SavePromptAsync(
        EntryDefinition entity,
        StructuralVariant variant,
        string prompt,
        string imageType,
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
        EntryDefinition entity,
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
        EntryDefinition entity,
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
}
