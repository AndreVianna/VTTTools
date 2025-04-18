namespace VttTools.Model.Game;

public class EpisodeAsset {
    public Guid EpisodeId { get; set; }
    public Guid AssetId { get; set; }
    public Episode Episode { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public Position Position { get; set; } = new();
    public double Scale { get; set; } = 1;
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}