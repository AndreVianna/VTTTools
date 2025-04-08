using static Microsoft.AspNetCore.Http.StatusCodes;

using static WebApi.Endpoints.IdentityEndpoints;
using static WebApi.Model.SignInStatus;

using IResult = Microsoft.AspNetCore.Http.IResult;

// ReSharper disable once CheckNamespace
namespace WebApi.Endpoints;

public static class IdentityProviderEndpoints {
    public static IEndpointRouteBuilder MapAuthenticationManagementEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/auth")
                       .WithTags("Authentication");

        group.MapPost(SignInEndpoint, SignInWithPassword)
             .WithName("SignInWithPassword")
             .Produces<SignInResponse>()
             .Produces(Status400BadRequest)
             .Produces(Status401Unauthorized)
             .Produces<ProblemDetails>(Status500InternalServerError);

        group.MapPost(SignOutEndpoint, SignOut)
             .WithName("SignOutUser")
             .Produces(Status200OK)
             .Produces<ProblemDetails>(Status500InternalServerError);

        group.MapGet(SchemesEndpoint, GetSchemes)
             .WithName("GetAuthenticationSchemes")
             .Produces<AuthenticationScheme[]>()
             .Produces<ProblemDetails>(Status500InternalServerError);

        return app;
    }

    private static async Task<IResult> SignInWithPassword(
        [FromServices] IIdentityManagementService service,
        [FromBody] PasswordSignInRequest request,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(MapAuthenticationManagementEndpoints)}.{nameof(SignInWithPassword)}");
        try {
            var result = await service.PasswordSignIn(request);
            return result.Status switch {
                AccountConfirmationRequired => Results.Ok(new SignInResponse { Token = result.Value.Value, RequiresConfirmation = true }),
                TwoFactorSetupIsPending => Results.Ok(new SignInResponse { Token = result.Value.Value, RequiresTwoFactor = true }),
                Success => Results.Ok(new SignInResponse { Token = result.Value.Value, TokenExpiration = result.Value.ValidUntil, }),
                InvalidInput => Results.BadRequest(result.Errors),
                _ => Results.Unauthorized(),
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Sign in failed for user: {User}.", request.Identifier);
            return Results.Problem("An unexpected error occurred during the sign in.",
                                   statusCode: Status500InternalServerError,
                                   title: "Sign In Failed");
        }
    }

    private static async Task<IResult> SignOut(
        [FromServices] IIdentityManagementService service,
        [FromBody] SignOutRequest request,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(MapAuthenticationManagementEndpoints)}.{nameof(SignOut)}");
        try {
            await service.SignOut(request);
            return Results.Ok();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Sign out failed for user: {User}.", request.Identifier);
            return Results.Problem("An unexpected error occurred during the sign out.",
                       statusCode: Status500InternalServerError,
                       title: "Sign Out Failed");
        }
    }

    private static async Task<IResult> GetSchemes(
        [FromServices] IIdentityManagementService service,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(MapAuthenticationManagementEndpoints)}.{nameof(GetSchemes)}");
        try {
            var schemes = await service.GetSchemes();
            return Results.Ok(schemes);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Get authentication schemes failed.");
            return Results.Problem("An unexpected error occurred while getting the authentication schemes.",
                       statusCode: Status500InternalServerError,
                       title: "Get Authentication Schemes Failed");
        }
    }
}
