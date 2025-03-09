namespace HttpServices.Identity;

public interface IAuthenticationService {
    Task<TypedResult<SignInStatus, string>> PasswordSignIn(PasswordSignInRequest request);
    Task SignOut(SignOutRequest request);
    Task<AuthenticationScheme[]> GetSchemes();
}