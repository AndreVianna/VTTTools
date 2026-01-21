namespace VttTools.Common.Model;

public record DiceRoll {
    public required string Expression { get; init; } // e.g., "2d6+5"
    public required int[] Results { get; init; }
    public required int Total { get; init; }
}