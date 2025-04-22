namespace VttTools.Model.Game;

public class Campaign {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    /// <summary>
    /// The owner of this campaign.
    /// </summary>
    public Guid OwnerId { get; set; }
    public Guid? ParentId { get; set; }
    public Epic? Epic { get; set; }
    public Guid? TemplateId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// The visibility setting for this campaign.
    /// </summary>
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public HashSet<Adventure> Adventures { get; set; } = [];
}