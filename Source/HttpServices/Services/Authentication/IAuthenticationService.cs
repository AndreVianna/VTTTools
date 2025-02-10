using SignInResult = DotNetToolbox.Results.SignInResult;

namespace HttpServices.Services.Authentication;

internal interface IAuthenticationService {
    Task<SignInResult> PasswordSignIn(PasswordSignInRequest request);
    Task SignOut(SignOutRequest request);
    Task<AuthenticationScheme[]> GetSchemes();
}