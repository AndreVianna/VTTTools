namespace VttTools.Library.Encounters.Model;

public record Grid {
    public GridType Type { get; init; }
    public CellSize CellSize { get; init; } = CellSize.Default;  // Using domain primitive
    public Offset Offset { get; init; } = Offset.Zero;  // Using domain primitive
    public bool Snap { get; init; }
}