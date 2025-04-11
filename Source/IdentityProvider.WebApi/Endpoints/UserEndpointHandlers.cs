using IAuthenticationService = WebApi.Services.IAuthenticationService;
using IResult = Microsoft.AspNetCore.Http.IResult;
using SignInResult = WebApi.Contracts.Authentication.SignInResult;

namespace WebApi.Endpoints;

internal static class UserEndpointHandlers
{
    internal static async Task<IResult> SignInAsync(
        [FromServices] IAuthenticationService service,
        [FromBody] PasswordSignInRequest request,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(UserEndpointMappings.MapUserAuthenticationEndpoints)}.{nameof(SignInAsync)}");
        try {
            var result = await service.PasswordSignIn(request);
            return result.Status switch {
                       SignInStatus.InvalidInput => Results.BadRequest(result.Errors),
                       SignInStatus.AccountNotFound => Results.NotFound(new SignInResponse { Result = SignInResult.AccountNotFound }),
                       SignInStatus.LoginProviderNotFound => Results.NotFound(new SignInResponse { Result = SignInResult.LoginProviderNotFound }),
                       SignInStatus.AccountIsBlocked => Results.Json(new SignInResponse { Result = SignInResult.Blocked }, statusCode: StatusCodes.Status401Unauthorized),
                       SignInStatus.AccountIsLocked => Results.Json(new SignInResponse { Result = SignInResult.Locked }, statusCode: StatusCodes.Status401Unauthorized),
                       SignInStatus.Incorrect => Results.Json(new SignInResponse { Result = SignInResult.InvalidSignIn }, statusCode: StatusCodes.Status401Unauthorized),
                       SignInStatus.AccountConfirmationRequired => Results.Json(new SignInResponse { Result = SignInResult.RequiresConfirmation, Token = result.Value.Value, TokenExpiration = result.Value.ValidUntil }, statusCode: StatusCodes.Status403Forbidden),
                       SignInStatus.TwoFactorIsNotSetup => Results.Json(new SignInResponse { Result = SignInResult.TwoFactorSetupPending }, statusCode: StatusCodes.Status403Forbidden),
                       SignInStatus.TwoFactorRequired => Results.Json(new SignInResponse { Result = SignInResult.RequiresTwoFactor, Token = result.Value.Value, TokenExpiration = result.Value.ValidUntil }, statusCode: StatusCodes.Status403Forbidden),
                       _ => Results.Ok(new SignInResponse { Result = SignInResult.Success, Token = result.Value.Value, TokenExpiration = result.Value.ValidUntil }),
                   };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Sign in failed for user: {User}.", request.Identifier);
            return Results.Problem("An unexpected error occurred during the sign in.",
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "Sign In Failed");
        }
    }

    internal static async Task<IResult> SignOutAsync(
        [FromServices] IAuthenticationService service,
        [FromBody] SignOutRequest request,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(UserEndpointMappings.MapUserAuthenticationEndpoints)}.{nameof(SignOutAsync)}");
        try {
            await service.SignOut(request);
            return Results.Ok();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Sign out failed for user: {User}.", request.Identifier);
            return Results.Problem("An unexpected error occurred during the sign out.",
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "Sign Out Failed");
        }
    }

    internal static async Task<IResult> GetAuthenticationSchemesAsync(
        [FromServices] IAuthenticationService service,
        [FromServices] ILoggerFactory loggerFactory) {
        var logger = loggerFactory.CreateLogger($"{nameof(UserEndpointMappings.MapUserAuthenticationEndpoints)}.{nameof(GetAuthenticationSchemesAsync)}");
        try {
            var schemes = await service.GetSchemes();
            return Results.Ok(schemes);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Get authentication schemes failed.");
            return Results.Problem("An unexpected error occurred while getting the authentication schemes.",
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "Get Authentication GetAuthenticationSchemes Failed");
        }
    }
}
