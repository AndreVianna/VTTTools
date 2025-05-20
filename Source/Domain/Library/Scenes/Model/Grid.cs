namespace VttTools.Library.Scenes.Model;

public record Grid {
    public GridType Type { get; init; }
    public Cell Cell { get; init; } = new();
}