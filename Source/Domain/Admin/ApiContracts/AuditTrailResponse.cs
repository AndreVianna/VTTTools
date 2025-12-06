namespace VttTools.Domain.Admin.ApiContracts;

public sealed record AuditTrailResponse : Response {
    public required IReadOnlyList<AuditLogSummary> Logs { get; init; }
    public required int TotalCount { get; init; }
    public required int Page { get; init; }
    public required int PageSize { get; init; }
}

public sealed record AuditLogSummary {
    public required Guid Id { get; init; }
    public required DateTime Timestamp { get; init; }
    public required string Action { get; init; }
    public required string EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public required string Result { get; init; }
    public string? IpAddress { get; init; }
    public required int DurationInMilliseconds { get; init; }
}