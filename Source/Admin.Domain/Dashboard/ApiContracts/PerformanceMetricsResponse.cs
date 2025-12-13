namespace VttTools.Admin.Dashboard.ApiContracts;

public sealed record PerformanceMetricsResponse {
    public required double AverageResponseTimeMs { get; init; }
    public required int RequestsPerMinute { get; init; }
    public required List<TimeSeriesDataPoint> ResponseTimeHistory { get; init; }
}
