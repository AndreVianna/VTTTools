using static HttpServices.Abstractions.AuthenticationEndpoints;

using IAuthenticationService = HttpServices.Services.Authentication.IAuthenticationService;
using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Routing;

public static class AuthenticationEndpoints {
    public static IEndpointRouteBuilder MapAuthenticationManagementEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost(SignInEndpoint, SignInWithPassword);
        app.MapPost(SignOutEndpoint, SignOut);
        app.MapGet(SchemesEndpoint, GetSchemes);
        return app;
    }

    private static async Task<IResult> SignInWithPassword([FromServices] IAuthenticationService service, [FromBody] PasswordSignInRequest request) {
        var result = await service.PasswordSignIn(request);
        return result switch {
                   { RequiresConfirmation: true } => Results.Ok(new SignInResponse { Token = result.Token!, RequiresConfirmation = true }),
                   { RequiresTwoFactor: true } => Results.Ok(new SignInResponse { Token = result.Token!, RequiresTwoFactor = true }),
                   { IsSuccess: true } => Results.Ok(new SignInResponse { Token = result.Token!, }),
                   { IsInvalid: true } => Results.BadRequest(result.Errors),
            _ => Results.Unauthorized(),
        };
    }

    private static async Task<IResult> SignOut([FromServices] IAuthenticationService service, [FromBody] SignOutRequest request) {
        await service.SignOut(request);
        return Results.Ok();
    }

    private static async Task<IResult> GetSchemes([FromServices] IAuthenticationService service) {
        var schemes = await service.GetSchemes();
        return Results.Ok(schemes ?? []);
    }
}
