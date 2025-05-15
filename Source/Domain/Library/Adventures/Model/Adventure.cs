namespace VttTools.Library.Adventures.Model;

public class Adventure {
    /// <summary>
    /// Optional parent campaign identifier.
    /// </summary>
    public Guid? CampaignId { get; set; }
    /// <summary>
    /// The campaign this adventure belongs to, if any.
    /// </summary>
    public Campaign? Campaign { get; set; }
    /// <summary>
    /// The unique identifier for this adventure.
    /// </summary>
    public Guid Id { get; set; } = Guid.CreateVersion7();
    /// <summary>
    /// The owner of this adventure.
    /// </summary>
    public Guid OwnerId { get; set; }
    /// <summary>
    /// The name of the adventure.
    /// </summary>
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// The type of adventure.
    /// </summary>
    public AdventureType Type { get; set; }
    /// <summary>
    /// The description of the adventure.
    /// </summary>
    [MaxLength(4096)]
    public string Description { get; set; } = string.Empty;
    /// <summary>
    /// The id of the image file associated with this adventure. If not set the id if the adventure is used.
    /// </summary>
    public Guid? ImageId { get; set; }
    /// <summary>
    /// Indicates whether the adventure is published (visible) or not (hidden).
    /// </summary>
    public bool IsListed { get; set; }
    /// <summary>
    /// Indicates whether the adventure is publicly accessible.
    /// </summary>
    public bool IsPublic { get; set; }
    /// <summary>
    /// The collection of scenes in this adventure.
    /// </summary>
    public List<Scene> Scenes { get; set; } = [];
}