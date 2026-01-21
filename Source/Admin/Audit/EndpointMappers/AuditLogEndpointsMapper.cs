namespace VttTools.Admin.Audit.EndpointMappers;

public static class AuditLogEndpointsMapper {
    public static IEndpointRouteBuilder MapAuditLogEndpoints(this IEndpointRouteBuilder app) {
        var auditGroup = app.MapGroup("/api/admin/audit")
            .RequireAuthorization()
            .RequireRateLimiting("read");

        auditGroup.MapGet("", AuditLogHandlers.QueryAuditLogsHandler)
            .WithName("QueryAuditLogs");

        auditGroup.MapGet("{id:guid}", AuditLogHandlers.GetAuditLogByIdHandler)
            .WithName("GetAuditLogById");

        auditGroup.MapGet("count", AuditLogHandlers.GetAuditLogCountHandler)
            .WithName("GetAuditLogCount");

        return app;
    }
}