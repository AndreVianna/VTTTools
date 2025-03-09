using static HttpServices.AuthenticationEndpoints;
using static HttpServices.Identity.Model.SignInStatus;

using IAuthenticationService = HttpServices.Identity.IAuthenticationService;
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
        return result.Status switch {
            EmailNotConfirmed => Results.Ok(new SignInResponse { Token = result.Value, RequiresConfirmation = true }),
            RequiresTwoFactor => Results.Ok(new SignInResponse { Token = result.Value, RequiresTwoFactor = true }),
            Success => Results.Ok(new SignInResponse { Token = result.Value, }),
            InvalidInput => Results.BadRequest(result.Errors),
            _ => Results.Unauthorized(),
        };
    }

    private static async Task<IResult> SignOut([FromServices] IAuthenticationService service, [FromBody] SignOutRequest request) {
        await service.SignOut(request);
        return Results.Ok();
    }

    private static async Task<IResult> GetSchemes([FromServices] IAuthenticationService service) {
        var schemes = await service.GetSchemes();
        return Results.Ok(schemes);
    }
}
