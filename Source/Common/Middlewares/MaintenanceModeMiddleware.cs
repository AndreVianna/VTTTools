
namespace VttTools.Middlewares;

public class MaintenanceModeMiddleware(
    RequestDelegate next,
    IServiceProvider serviceProvider,
    ILogger<MaintenanceModeMiddleware> logger) {

    public async Task InvokeAsync(HttpContext context) {
        if (IsPathExcluded(context.Request.Path)) {
            await next(context);
            return;
        }

        MaintenanceMode? maintenanceMode;
        try {
            await using var scope = serviceProvider.CreateAsyncScope();
            var maintenanceService = scope.ServiceProvider.GetRequiredService<IMaintenanceModeService>();
            maintenanceMode = await maintenanceService.GetCurrentAsync(context.RequestAborted);
        }
        catch (InvalidOperationException ex) {
            logger.LogError(ex, "Failed to resolve IMaintenanceModeService");
            throw;
        }

        var now = DateTime.UtcNow;
        var isActive = maintenanceMode?.IsEnabled == true
            && (!maintenanceMode.ScheduledStartTime.HasValue || now >= maintenanceMode.ScheduledStartTime.Value)
            && (!maintenanceMode.ScheduledEndTime.HasValue || now <= maintenanceMode.ScheduledEndTime.Value);

        if (!isActive) {
            await next(context);
            return;
        }

        var isAdmin = context.User.Identity is { IsAuthenticated: true }
            && context.User.IsInRole("Admin");

        if (isAdmin) {
            logger.LogInformation("Admin user bypassing maintenance mode: {UserId}",
                context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            await next(context);
            return;
        }

        logger.LogWarning("Request blocked due to maintenance mode: {Method} {Path}",
            context.Request.Method, context.Request.Path);

        context.Response.StatusCode = 503;
        context.Response.ContentType = "application/json";

        var response = new {
            error = "Service Unavailable",
            message = maintenanceMode!.Message,
            retryAfter = maintenanceMode.ScheduledEndTime?.ToString("o")
        };

        await context.Response.WriteAsJsonAsync(response, context.RequestAborted);
    }

    private static bool IsPathExcluded(PathString path) {
        string[] excludedPaths = ["/health", "/healthz", "/alive"];
        var pathStr = path.ToString();
        return excludedPaths.Any(excluded =>
            pathStr.Equals(excluded, StringComparison.OrdinalIgnoreCase) ||
            pathStr.StartsWith($"{excluded}/", StringComparison.OrdinalIgnoreCase));
    }
}