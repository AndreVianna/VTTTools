using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Dashboard.Handlers;

public static class HealthCheckHandlers {
    [Authorize(Roles = "Administrator")]
    public static async Task<IResult> GetHealthChecksHandler(
        ClaimsPrincipal user,
        HealthCheckService healthCheckService,
        IAuditLogService auditLogService,
        CancellationToken ct) {

        var stopwatch = Stopwatch.StartNew();
        var healthReport = await healthCheckService.CheckHealthAsync(ct);
        stopwatch.Stop();

        var response = new HealthCheckResponse {
            Status = healthReport.Status.ToString(),
            TotalDuration = $"{healthReport.TotalDuration.TotalMilliseconds:F2}ms",
            Results = [.. healthReport.Entries
                .Select(entry => new VttTools.Admin.Dashboard.Model.HealthCheckResult {
                    Name = entry.Key,
                    Status = entry.Value.Status.ToString(),
                    Duration = $"{entry.Value.Duration.TotalMilliseconds:F2}ms",
                    Description = entry.Value.Description,
                    Data = entry.Value.Data.Count > 0 ? entry.Value.Data.ToDictionary(d => d.Key, d => d.Value) : null,
                    Exception = entry.Value.Exception?.Message,
                    Tags = [.. entry.Value.Tags],
                })]
        };

        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is not null) {
            await auditLogService.AddAsync(new AuditLog {
                UserId = Guid.Parse(userId),
                Action = "Dashboard:HealthChecks:ByUser",
                EntityType = "Dashboard",
            }, ct);
        }

        return Results.Ok(response);
    }
}