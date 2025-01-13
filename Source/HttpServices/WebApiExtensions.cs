namespace Microsoft.Extensions.Hosting;

public static class WebApiExtensions {
    public static WebApi EnableAuthenticationManagement(this WebApi api) {
        if (api.Type != WebApiType.Default)
            throw new InvalidOperationException("Client authentication management is not supported by slim or empty WebApi instances.");
        api.MapApiClientManagementEndpoints();
        return api;
    }

    private static IEndpointRouteBuilder MapApiClientManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/tokens", ApiAuthenticationManagementEndpoints.GenerateTokenAsync)
           .Produces<NewTokenResponse>()
           .Produces(StatusCodes.Status401Unauthorized);
        app.MapGet("/tokens", ApiAuthenticationManagementEndpoints.GetTokenAsync)
           .Produces<TokenResponse>()
           .Produces(StatusCodes.Status404NotFound);
        app.MapPost("/clients", ApiAuthenticationManagementEndpoints.RegisterAsync);
        return app;
    }
}
