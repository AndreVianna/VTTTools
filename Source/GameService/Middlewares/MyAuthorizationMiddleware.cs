namespace VttTools.GameService.Middlewares;

public sealed class MyAuthorizationMiddleware(RequestDelegate next, IAuthorizationPolicyProvider policyProvider, IServiceProvider services, ILogger<AuthorizationMiddleware> logger) {
    private readonly AuthorizationMiddleware _internal = new(next, policyProvider, services, logger);

    public Task Invoke(HttpContext context) {
        var authorization = context.Request.Headers.Authorization.FirstOrDefault();
        var values = authorization?.Split(" ") ?? [];
        if (values is ["Basic", _])
            context.User = new(new ClaimsIdentity([new(ClaimTypes.NameIdentifier, values[1])], ClaimTypes.NameIdentifier));
        return _internal.Invoke(context);
    }
}