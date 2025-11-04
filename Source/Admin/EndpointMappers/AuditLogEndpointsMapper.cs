namespace VttTools.Admin.EndpointMappers;

public static class AuditLogEndpointsMapper {
    public static IEndpointRouteBuilder MapAuditLogEndpoints(this IEndpointRouteBuilder app) {
        var auditGroup = app.MapGroup("/api/admin/audit")
            .RequireAuthorization()
            .RequireRateLimiting("audit");

        auditGroup.MapGet("", AuditLogHandlers.QueryAuditLogsHandler)
            .WithName("QueryAuditLogs")
            .WithOpenApi();

        auditGroup.MapGet("{id:guid}", AuditLogHandlers.GetAuditLogByIdHandler)
            .WithName("GetAuditLogById")
            .WithOpenApi();

        auditGroup.MapGet("count", AuditLogHandlers.GetAuditLogCountHandler)
            .WithName("GetAuditLogCount")
            .WithOpenApi();

        return app;
    }
}
