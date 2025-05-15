namespace VttTools.Library.Scenes.Model;

public record Stage {
    [MaxLength(512)]
    public string Source { get; set; } = string.Empty;
    public Size Size { get; set; } = new();
    public Grid Grid { get; set; } = new();
}