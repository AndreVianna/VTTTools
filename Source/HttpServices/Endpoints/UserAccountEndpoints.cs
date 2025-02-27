using static HttpServices.Abstractions.UserAccountEndpoints;

using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class UserAccountEndpoints {
    public static IEndpointRouteBuilder MapUserAccountManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapGet(FindUserByIdEndpoint, FindByIdAsync);
        app.MapPost(UsersEndpoint, RegisterAsync);
        return app;
    }

    private static async Task<IResult> FindByIdAsync([FromServices] IAccountService service, string id) {
        var response = await service.FindAsync(id, null);
        return response is not null ? Results.Ok(response)
                   : Results.NotFound();
    }

    private static async Task<IResult> RegisterAsync([FromServices] IAccountService service, [FromBody] RegisterUserRequest request) {
        var response = await service.CreateAsync(request);
        return response.IsSuccessful ? Results.Ok(response.Value)
                   : Results.BadRequest(response.Errors);
    }
}
