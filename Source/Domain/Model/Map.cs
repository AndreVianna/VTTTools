namespace Domain.Model;

public record Map {
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string PlayerImageUrl { get; init; }
    public string? GameMasterImageUrl { get; init; }
    public required uint Width {
        get;
        init => field = value < 1
            ? throw new ArgumentOutOfRangeException(nameof(Width), value, "The map width in cells must not be zero.")
            : value;
    } = 1; // in grid cells
    public required uint Height {
        get;
        init => field = value < 1
            ? throw new ArgumentOutOfRangeException(nameof(Height), value, "The map height in cells must not be zero.")
            : value;
    } = 1; // in grid cells
    public decimal HorizontalOffset { get; init; } // in pixels
    public decimal VerticalOffset { get; init; } // in pixels
    public decimal CellWidth {
        get;
        init => field = value <= 0
            ? throw new ArgumentOutOfRangeException(nameof(CellWidth), value, "The map cell width must be greater than zero.")
            : value;
    } = 50; // in pixels
    public decimal CellHeight {
        get;
        init => field = value <= 0
            ? throw new ArgumentOutOfRangeException(nameof(CellHeight), value, "The map cell height must be greater than zero.")
            : value;
    } = 50; // in pixels
    public List<GameToken> Tokens { get; init; } = [];
}
