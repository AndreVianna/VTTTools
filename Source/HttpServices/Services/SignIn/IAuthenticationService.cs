using SignInResult = DotNetToolbox.Results.SignInResult;

namespace HttpServices.Services.SignIn;

internal interface IAuthenticationService {
    Task<SignInResult> PasswordSignInAsync(PasswordSignInRequest request);
}