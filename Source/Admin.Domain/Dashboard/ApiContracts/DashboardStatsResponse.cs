namespace VttTools.Admin.Dashboard.ApiContracts;

public sealed record DashboardStatsResponse {
    public required int TotalUsers { get; init; }
    public required int ActiveUsers24h { get; init; }
    public required int TotalAuditLogs { get; init; }
    public required decimal StorageUsedGB { get; init; }
}