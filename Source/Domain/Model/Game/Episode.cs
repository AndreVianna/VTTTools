namespace VttTools.Model.Game;

public class Episode {
    public Guid Id { get; set; }
    /// <summary>
    /// The owner of this episode.
    /// </summary>
    public Guid OwnerId { get; set; }
    public Guid ParentId { get; set; }
    public Adventure Adventure { get; set; } = null!;
    public bool IsTemplate { get; set; } = true;
    public Guid? TemplateId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// The visibility setting for this episode.
    /// </summary>
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public Stage Stage { get; set; } = new();
    public HashSet<EpisodeAsset> EpisodeAssets { get; set; } = [];
}
