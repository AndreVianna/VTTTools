using VttTools.Extensions;

namespace VttTools.Middlewares;

public sealed class InternalApiKeyMiddleware(
    RequestDelegate next,
    IOptions<InternalApiOptions> options,
    ILogger<InternalApiKeyMiddleware> logger) {
    private readonly InternalApiOptions _options = options.Value;

    public async Task InvokeAsync(HttpContext context) {
        if (context.User.Identity?.IsAuthenticated == true) {
            await next(context);
            return;
        }

        if (context.Request.Headers.TryGetValue("X-Api-Key", out var apiKey)
            && !string.IsNullOrEmpty(_options.ApiKey)
            && apiKey == _options.ApiKey) {
            var serviceName = context.Request.Headers["X-Service-Name"].FirstOrDefault() ?? "Unknown";
            context.SetInternalService(serviceName);

            logger.LogDebug(
                "Internal service call from {ServiceName} to {Path}",
                serviceName,
                context.Request.Path);
        }

        await next(context);
    }
}
