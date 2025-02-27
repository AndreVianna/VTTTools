namespace HttpServices.Services.Authentication;

internal interface IAuthenticationService {
    Task<TypedResult<SignInStatus, string>> PasswordSignIn(PasswordSignInRequest request);
    Task SignOut(SignOutRequest request);
    Task<AuthenticationScheme[]> GetSchemes();
}