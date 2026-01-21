namespace VttTools.Admin.Audit.ApiContracts;

public sealed record AuditTrailResponse
    : Response {
    public required IReadOnlyList<AuditLogSummary> Logs { get; init; }
    public required int TotalCount { get; init; }
    public required int Page { get; init; }
    public required int PageSize { get; init; }
}