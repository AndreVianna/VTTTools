using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class AuthenticationEndpoints {
    public static IEndpointRouteBuilder MapAuthenticationManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/signin", SignInWithPasswordAsync);
        return app;
    }

    private static async Task<IResult> SignInWithPasswordAsync(IAuthenticationService service, PasswordSignInRequest request) {
        var result = await service.PasswordSignInAsync(request);
        return result switch {
                   { RequiresConfirmation: true } => Results.Ok(new SignInResponse { Token = result.Token!, RequiresConfirmation = true }),
                   { RequiresTwoFactor: true } => Results.Ok(new SignInResponse { Token = result.Token!, RequiresTwoFactor = true }),
                   { IsSuccess: true } => Results.Ok(new SignInResponse { Token = result.Token!, }),
                   { IsInvalid: true } => Results.BadRequest(result.Errors),
            _ => Results.Unauthorized(),
        };
    }
}
