namespace VttTools.Extensions;

public static class AuditLoggingExtensions {
    public static IHostApplicationBuilder AddAuditLogging(this IHostApplicationBuilder builder) {
        builder.Services.Configure<AuditLoggingOptions>(
            builder.Configuration.GetSection(AuditLoggingOptions.SectionName));
        return builder;
    }

    public static IApplicationBuilder UseAuditLogging(this IApplicationBuilder app)
        => app.UseMiddleware<AuditLoggingMiddleware>();
}
