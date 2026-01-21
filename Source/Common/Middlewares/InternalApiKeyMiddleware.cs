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

        var hasApiKeyHeader = context.Request.Headers.TryGetValue("X-Api-Key", out var apiKey);
        var hasConfiguredKey = !string.IsNullOrEmpty(_options.ApiKey);

        if (hasApiKeyHeader && hasConfiguredKey && apiKey == _options.ApiKey) {
            var serviceName = context.Request.Headers["X-Service-Name"].FirstOrDefault() ?? "Unknown";
            context.SetInternalService(serviceName);

            var claims = new[] {
                new Claim(ClaimTypes.Name, serviceName),
                new Claim(ClaimTypes.Role, "InternalService"),
                new Claim("service_name", serviceName),
            };
            var identity = new ClaimsIdentity(claims, "InternalApiKey");
            context.User = new ClaimsPrincipal(identity);

            logger.LogDebug(
                "Internal service call authenticated from {ServiceName} to {Path}",
                serviceName,
                context.Request.Path);
        }
        else if (hasApiKeyHeader) {
            logger.LogWarning(
                "SECURITY: Invalid API key attempt from {RemoteIp} to {Path}",
                context.Connection.RemoteIpAddress,
                context.Request.Path);
        }

        await next(context);
    }
}