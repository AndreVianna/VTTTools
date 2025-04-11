namespace WebApi.Services;

public interface IAuthenticationService {
    Task<TypedResult<SignInStatus, TemporaryToken>> PasswordSignIn(PasswordSignInRequest request);
    Task SignOut(SignOutRequest request);
    Task<AuthenticationScheme[]> GetSchemes();
}