namespace VttTools.Domain.Admin.ApiContracts;

public sealed record PerformanceMetricsResponse {
    public required double AverageResponseTimeMs { get; init; }
    public required int RequestsPerMinute { get; init; }
    public required List<TimeSeriesDataPoint> ResponseTimeHistory { get; init; }
}

public sealed record TimeSeriesDataPoint {
    public required DateTime Timestamp { get; init; }
    public required double Value { get; init; }
}