using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class UserAccountEndpoints {
    public static IEndpointRouteBuilder MapUserAccountManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapGet("/users/{id}", FindByIdAsync);
        app.MapPost("/users", RegisterAsync);
        return app;
    }

    private static async Task<IResult> FindByIdAsync(IAccountService service, string id) {
        var response = await service.FindAsync(id, null);
        return response is not null ? Results.Ok(response)
                   : Results.NotFound();
    }

    private static async Task<IResult> RegisterAsync(IAccountService service, RegisterUserRequest request) {
        var response = await service.CreateAsync(request);
        return response.IsSuccess ? Results.Ok(response.Value)
                   : Results.BadRequest(response.Errors);
    }
}
