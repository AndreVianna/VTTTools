namespace VttTools.Library.Adventures.Model;

public class Adventure {
    /// <summary>
    /// The unique identifier for this adventure.
    /// </summary>
    public Guid Id { get; set; } = Guid.CreateVersion7();

    /// <summary>
    /// The owner of this adventure.
    /// </summary>
    public Guid OwnerId { get; set; }

    /// <summary>
    /// Optional parent campaign identifier.
    /// </summary>
    public Guid? ParentId { get; set; }

    /// <summary>
    /// The template this adventure was created from, if any.
    /// </summary>
    public Guid? TemplateId { get; set; }

    /// <summary>
    /// The campaign this adventure belongs to, if any.
    /// </summary>
    public Campaign? Campaign { get; set; }

    /// <summary>
    /// The collection of scenes in this adventure.
    /// </summary>
    public List<Scene> Scenes { get; set; } = [];

    /// <summary>
    /// The name of the adventure.
    /// </summary>
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The description of the adventure.
    /// </summary>
    [MaxLength(1024)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The type of adventure.
    /// </summary>
    public AdventureType Type { get; set; } = AdventureType.OpenWorld;

    /// <summary>
    /// Path to the adventure's image.
    /// </summary>
    public string? ImagePath { get; set; }

    /// <summary>
    /// Indicates whether the adventure is published (visible) or not (hidden).
    /// </summary>
    public bool IsVisible { get; set; }

    /// <summary>
    /// Indicates whether the adventure is publicly accessible.
    /// </summary>
    public bool IsPublic { get; set; }
}