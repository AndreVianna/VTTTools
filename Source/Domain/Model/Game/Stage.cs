namespace VttTools.Model.Game;

public class Stage {
    public StageMapType MapType { get; set; }
    [MaxLength(512)]
    public string Source { get; set; } = string.Empty;
    public Size Size { get; set; } = new();
    public Grid Grid { get; set; } = new();
}