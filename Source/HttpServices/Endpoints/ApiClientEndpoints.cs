using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class ApiClientEndpoints {
    public static IEndpointRouteBuilder MapApiClientManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/tokens", GenerateAsync);
        app.MapPost("/clients", RegisterAsync);
        return app;
    }

    private static async Task<IResult> GenerateAsync(ITokenService service, HttpContext context) {
        var token = await service.GenerateClientTokenAsync(context);
        return token is null
            ? Results.Unauthorized()
            : Results.Ok(token);
    }

    private static async Task<IResult> RegisterAsync(IClientService service, RegisterClientRequest request) {
        var result = await service.RegisterAsync(request);
        return Results.Ok(result);
    }
}
