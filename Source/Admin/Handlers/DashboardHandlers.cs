namespace VttTools.Admin.Handlers;

public static class DashboardHandlers {
    public static async Task<IResult> GetDashboardStatsHandler(
        IDashboardService dashboardService,
        CancellationToken ct) {
        try {
            var stats = await dashboardService.GetStatsAsync(ct);
            return Results.Ok(stats);
        }
        catch (Exception) {
            return Results.Problem("An error occurred while retrieving dashboard statistics.");
        }
    }

    public static async Task<IResult> GetPerformanceMetricsHandler(
        [FromQuery] int hours,
        IDashboardService dashboardService,
        CancellationToken ct) {
        if (hours is < 1 or > 168) {
            return Results.BadRequest(new { error = "Hours must be between 1 and 168." });
        }

        try {
            var metrics = await dashboardService.GetMetricsAsync(hours, ct);
            return Results.Ok(metrics);
        }
        catch (ArgumentOutOfRangeException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception) {
            return Results.Problem("An error occurred while retrieving performance metrics.");
        }
    }
}