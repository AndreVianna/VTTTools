using IResult = Microsoft.AspNetCore.Http.IResult;

namespace HttpServices.Services.SignIn;

internal static class AuthenticationManager {
    public static void MapSignInEndpoints(this WebApplication app)
        => app.MapPost("/signin", SignInWithPasswordAsync);

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
