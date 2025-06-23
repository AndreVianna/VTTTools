namespace VttTools.HealthChecks;

/// <summary>
/// Provides comprehensive health check response writing functionality with detailed JSON output.
/// </summary>
public static class DetailedHealthCheckResponseWriter {
    /// <summary>
    /// Writes a detailed health check response to the HTTP context in JSON format.
    /// </summary>
    /// <param name="context">The HTTP context to write the response to.</param>
    /// <param name="report">The health report containing check results.</param>
    /// <returns>A task representing the asynchronous write operation.</returns>
    public static async Task WriteResponse(HttpContext context, HealthReport report) {
        context.Response.ContentType = "application/json; charset=utf-8";

        var response = new {
            status = report.Status.ToString(),
            totalDuration = $"{report.TotalDuration.TotalMilliseconds:F2}ms",
            results = report.Entries.Select(entry => new {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                duration = $"{entry.Value.Duration.TotalMilliseconds:F2}ms",
                description = entry.Value.Description,
                data = entry.Value.Data.Any() ? entry.Value.Data : null,
                exception = entry.Value.Exception?.Message,
                tags = entry.Value.Tags.Any() ? entry.Value.Tags : null
            }).ToList()
        };

        var options = new JsonSerializerOptions {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        await JsonSerializer.SerializeAsync(context.Response.Body, response, options);
    }
}