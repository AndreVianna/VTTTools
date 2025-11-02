namespace VttTools.Data.Assets.Entities;

public class TokenStyle {
    public string? BorderColor { get; set; }
    public string? BackgroundColor { get; set; }
    public TokenShape Shape { get; set; } = TokenShape.Circle;
}