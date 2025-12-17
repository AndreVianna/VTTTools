namespace VttTools.Middlewares;

public sealed class InternalApiKeyMiddleware(
    RequestDelegate next,
    IOptions<InternalApiOptions> options,
    ILogger<InternalApiKeyMiddleware> logger) {
    private readonly InternalApiOptions _options = options.Value;

    public async Task InvokeAsync(HttpContext context) {
        logger.LogInformation(
            "InternalApiKeyMiddleware - Path: {Path}, IsAuthenticated: {IsAuth}, AuthType: {AuthType}",
            context.Request.Path,
            context.User.Identity?.IsAuthenticated,
            context.User.Identity?.AuthenticationType ?? "none");

        if (context.User.Identity?.IsAuthenticated == true) {
            logger.LogInformation("User already authenticated via {AuthType}, skipping API key check",
                context.User.Identity.AuthenticationType);
            await next(context);
            return;
        }

        var hasApiKeyHeader = context.Request.Headers.TryGetValue("X-Api-Key", out var apiKey);
        var hasConfiguredKey = !string.IsNullOrEmpty(_options.ApiKey);

        logger.LogInformation(
            "API Key check - HasHeader: {HasHeader}, HasConfigured: {HasConfigured}, KeysMatch: {Match}, Path: {Path}",
            hasApiKeyHeader,
            hasConfiguredKey,
            hasApiKeyHeader && hasConfiguredKey && apiKey == _options.ApiKey,
            context.Request.Path);

        if (hasApiKeyHeader && hasConfiguredKey && apiKey == _options.ApiKey) {
            var serviceName = context.Request.Headers["X-Service-Name"].FirstOrDefault() ?? "Unknown";
            context.SetInternalService(serviceName);

            // Create an authenticated principal for internal service calls
            var claims = new[] {
                new Claim(ClaimTypes.Name, serviceName),
                new Claim(ClaimTypes.Role, "InternalService"),
                new Claim("service_name", serviceName),
            };
            var identity = new ClaimsIdentity(claims, "InternalApiKey");
            context.User = new ClaimsPrincipal(identity);

            logger.LogInformation(
                "Internal service call authenticated from {ServiceName} to {Path}",
                serviceName,
                context.Request.Path);
        }

        await next(context);
    }
}
