namespace VttTools.Library.Stages.Model;

public record Grid {
    public GridType Type { get; init; } = GridType.Square;
    public CellSize CellSize { get; init; } = CellSize.Default;
    public Offset Offset { get; init; } = Offset.Zero;
    public double Scale { get; init; } = 5.0;
}