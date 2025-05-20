namespace VttTools.Library.Adventures.Model;

public record Adventure {
    /// <summary>
    /// The owner of this adventure.
    /// </summary>
    public Guid OwnerId { get; init; }
    /// <summary>
    /// Optional parent campaign identifier.
    /// </summary>
    public Guid? CampaignId { get; init; }
    /// <summary>
    /// The unique identifier for this adventure.
    /// </summary>
    public Guid Id { get; init; } = Guid.CreateVersion7();
    /// <summary>
    /// The name of the adventure.
    /// </summary>
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    /// <summary>
    /// The type of adventure.
    /// </summary>
    public AdventureType Type { get; init; }
    /// <summary>
    /// The description of the adventure.
    /// </summary>
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    /// <summary>
    /// The id of the image file associated with this adventure. If not set the id if the adventure is used.
    /// </summary>
    public Guid? ImageId { get; init; }
    /// <summary>
    /// Indicates whether the adventure is published (visible) or not (hidden).
    /// </summary>
    public bool IsPublished { get; init; }
    /// <summary>
    /// Indicates whether the adventure is publicly accessible.
    /// </summary>
    public bool IsPublic { get; init; }
    /// <summary>
    /// The collection of scenes in this adventure.
    /// </summary>
    public List<Scene> Scenes { get; init; } = [];
}