using static HttpServices.ApiClientEndpoints;

using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class ApiClientEndpoints {
    public static IEndpointRouteBuilder MapApiClientManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost(TokensEndpoint, GenerateAsync);
        app.MapPost(ClientsEndpoint, RegisterAsync);
        return app;
    }

    private static async Task<IResult> GenerateAsync([FromServices] IApiConsumerService service, [FromBody] GenerateTokenRequest request) {
        var result = await service.GenerateTokenAsync(request);
        return result.HasErrors
                   ? Results.BadRequest(result.Errors)
                   : result.Value is null
                       ? Results.Unauthorized()
                       : Results.Ok(result.Value);
    }

    private static async Task<IResult> RegisterAsync([FromServices] IApiConsumerService service, [FromBody] RegisterClientRequest request) {
        var result = await service.RegisterAsync(request);
        return Results.Ok(result);
    }
}
