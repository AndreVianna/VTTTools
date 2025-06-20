namespace VttTools.WebApp.Utilities;

public class PersistentAuthenticationStateProvider
    : AuthenticationStateProvider
{
    private readonly AuthenticationState _persistedState = new(new(new ClaimsIdentity()));

    public PersistentAuthenticationStateProvider(PersistentComponentState state)
    {
        if (!state.TryTakeFromJson<BasicUserInfo>(nameof(BasicUserInfo), out var userInfo) || userInfo is null)
            return;

        var claims = new Claim[]  {
            new(ClaimTypes.NameIdentifier, userInfo.Id.ToString()),
            new(ClaimTypes.GivenName, userInfo.DisplayName),
            new(ClaimTypes.Email, userInfo.Email),
            new(ClaimTypes.Role, userInfo.IsAdministrator ? "Administrator" : "User")
        };
        var identity = new ClaimsIdentity(claims, authenticationType: nameof(PersistentAuthenticationStateProvider));
        var user = new ClaimsPrincipal(identity);
        _persistedState = new(user);
    }

    public override Task<AuthenticationState> GetAuthenticationStateAsync() => Task.FromResult(_persistedState);
}