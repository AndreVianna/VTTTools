namespace VttTools.AI.Model;

/// <summary>
/// Represents a specific AI model configuration for a provider stored in the database.
/// Each provider can have multiple models for different categories of generation.
/// </summary>
public record AiProviderModel {
    /// <summary>
    /// Gets the unique identifier for the model configuration.
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();

    /// <summary>
    /// Gets the foreign key to the parent AI provider configuration.
    /// </summary>
    public Guid ProviderId { get; init; }

    /// <summary>
    /// Gets the category of content this model generates (e.g., Image, Audio, Text).
    /// </summary>
    public GeneratedContentType Category { get; init; }

    /// <summary>
    /// Gets the specific model name (e.g., "gpt-image-1", "sd3", "eleven_multilingual_v2").
    /// </summary>
    public string ModelName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the API endpoint path for this model (e.g., "/v1/images/generations").
    /// </summary>
    public string Endpoint { get; init; } = string.Empty;

    /// <summary>
    /// Gets a value indicating whether this is the default model for the category.
    /// </summary>
    public bool IsDefault { get; init; }

    /// <summary>
    /// Gets a value indicating whether this model is enabled for use.
    /// </summary>
    public bool IsEnabled { get; init; } = true;
}
