namespace VttTools.Admin.Infrastructure;

public class DatabaseHealthCheck(ApplicationDbContext dbContext) : IHealthCheck {
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) {
        try {
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
            return canConnect
                ? HealthCheckResult.Healthy("Database connection successful")
                : HealthCheckResult.Unhealthy("Database connection failed");
        }
        catch (Exception ex) {
            return HealthCheckResult.Unhealthy("Database connection failed", ex);
        }
    }
}
