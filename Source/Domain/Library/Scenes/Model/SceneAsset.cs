namespace VttTools.Library.Scenes.Model;

public class SceneAsset {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid SceneId { get; set; }
    public Guid AssetId { get; set; }
    public Scene Scene { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public Position Position { get; set; } = new();
    public double Scale { get; set; } = 1;
    public bool IsLocked { get; set; }
    public Guid? ControlledBy { get; set; }
}