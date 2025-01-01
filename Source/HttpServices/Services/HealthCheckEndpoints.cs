namespace HttpServices.Services;

internal static class HealthCheckEndpoints {
    public static void MapHealthCheckEndpoints(this WebApplication app) {
        if (!app.Environment.IsDevelopment())
            return;
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") });
    }
}
