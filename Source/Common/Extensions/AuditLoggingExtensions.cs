namespace VttTools.Extensions;

public static class AuditLoggingExtensions {
    public static IApplicationBuilder UseAuditLogging(this IApplicationBuilder app)
        => app.UseMiddleware<AuditLoggingMiddleware>();
}
