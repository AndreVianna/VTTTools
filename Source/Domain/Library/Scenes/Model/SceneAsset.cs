namespace VttTools.Library.Scenes.Model;

public class SceneAsset {
    public Guid SceneId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Guid AssetId { get; set; }
    public uint Number { get; set; }
    public Asset Asset { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public AssetDisplay Display { get; set; } = new();
    public Position Position { get; set; } = new();
    public double Scale { get; set; } = 1;
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}