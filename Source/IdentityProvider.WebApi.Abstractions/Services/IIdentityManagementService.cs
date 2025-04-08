namespace WebApi.Services;

public interface IIdentityManagementService {
    Task<TypedResult<SignInStatus, TemporaryToken>> PasswordSignIn(PasswordSignInRequest request);
    Task SignOut(SignOutRequest request);
    Task<AuthenticationScheme[]> GetSchemes();
}