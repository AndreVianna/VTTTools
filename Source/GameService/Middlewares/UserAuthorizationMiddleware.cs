namespace VttTools.GameService.Middlewares;

public sealed class UserAuthorizationMiddleware(RequestDelegate next,
                                                IAuthorizationPolicyProvider policyProvider,
                                                IServiceProvider services,
                                                ILogger<AuthorizationMiddleware> logger) {
    private readonly AuthorizationMiddleware _internal = new(next, policyProvider, services, logger);

    public Task Invoke(HttpContext context) {
        var authorization = context.Request.Headers.Authorization.FirstOrDefault();
        var values = authorization?.Split(" ") ?? [];
        if (values is not ["Basic", var userId])
            return _internal.Invoke(context);
        var claim = new Claim(ClaimTypes.NameIdentifier, userId);
        context.User = new(new ClaimsIdentity([claim], ClaimTypes.NameIdentifier));
        return _internal.Invoke(context);
    }
}