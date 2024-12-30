namespace AuthService.Handlers.SignIn;

internal interface ISignInHandler {
    Task<DotNetToolbox.Results.SignInResult> PasswordSignInAsync(PasswordSignInRequest request);
}