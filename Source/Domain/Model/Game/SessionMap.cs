namespace VttTools.Model.Game;

public class SessionMap {
    public int Number { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(256)]
    public string ImageUrl { get; set; } = string.Empty;
    [MaxLength(256)]
    public string? MasterImageUrl { get; set; }
    public Size Size { get; set; } = new();
    public Grid Grid { get; set; } = new();
    public List<SessionMapToken> Tokens { get; set; } = [];
}
