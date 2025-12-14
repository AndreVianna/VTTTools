using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Audit.Handlers;

public static class AuditLogHandlers {
    public static async Task<IResult> QueryAuditLogsHandler(
        [AsParameters] AuditLogQueryRequest request,
        IAuditLogService service,
        CancellationToken ct) {

        if (request.Take > 100) {
            return Results.BadRequest(new { error = "Take must be less than or equal to 100" });
        }

        if (request.Skip < 0) {
            return Results.BadRequest(new { error = "Skip must be greater than or equal to 0" });
        }

        if (request.Take <= 0) {
            return Results.BadRequest(new { error = "Take must be greater than 0" });
        }

        (var items, var totalCount) = await service.QueryAsync(
                                                               request.StartDate,
                                                               request.EndDate,
                                                               request.UserId,
                                                               request.Action,
                                                               request.EntityType,
                                                               request.Result,
                                                               request.Skip,
                                                               request.Take,
                                                               ct);

        var response = new AuditLogQueryResponse {
            Items = items,
            TotalCount = totalCount
        };

        return Results.Ok(response);
    }

    public static async Task<IResult> GetAuditLogByIdHandler(
        Guid id,
        IAuditLogService service,
        CancellationToken ct) {

        var auditLog = await service.GetByIdAsync(id, ct);

        return auditLog is null
            ? Results.NotFound()
            : Results.Ok(auditLog);
    }

    public static async Task<IResult> GetAuditLogCountHandler(
        IAuditLogService service,
        CancellationToken ct) {

        var count = await service.GetTotalCountAsync(ct);

        var response = new AuditLogCountResponse {
            Count = count
        };

        return Results.Ok(response);
    }
}