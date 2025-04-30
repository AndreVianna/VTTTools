namespace VttTools.Model.Game;

public class Adventure {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    /// <summary>
    /// The owner of this adventure.
    /// </summary>
    public Guid OwnerId { get; set; }
    public Guid? ParentId { get; set; }
    public Campaign? Campaign { get; set; }
    public Guid? TemplateId { get; set; }
    public List<Episode> Episodes { get; set; } = [];
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// The visibility setting for this adventure.
    /// </summary>
    public Visibility Visibility { get; set; } = Visibility.Hidden;
}