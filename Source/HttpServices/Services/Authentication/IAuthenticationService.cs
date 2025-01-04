using SignInResult = DotNetToolbox.Results.SignInResult;

namespace HttpServices.Services.Authentication;

internal interface IAuthenticationService {
    Task<SignInResult> PasswordSignInAsync(PasswordSignInRequest request);
}