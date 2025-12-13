namespace VttTools.Common.Model;

public sealed record TimeSeriesDataPoint {
    public required DateTime Timestamp { get; init; }
    public required double Value { get; init; }
}