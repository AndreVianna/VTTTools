namespace VttTools.WebApp.Server.Utilities;

public sealed class PersistingAuthenticationStateProvider
    : ServerAuthenticationStateProvider, IDisposable {
    private Task<AuthenticationState>? _authenticationStateTask;
    private readonly PersistentComponentState _state;
    private readonly PersistingComponentStateSubscription _subscription;
    private readonly IdentityOptions _options;

    public PersistingAuthenticationStateProvider(PersistentComponentState persistentComponentState, IOptions<IdentityOptions> optionsAccessor) {
        _options = optionsAccessor.Value;
        _state = persistentComponentState;
        AuthenticationStateChanged += OnAuthenticationStateChanged;
        _subscription = _state.RegisterOnPersisting(OnPersistingAsync, RenderMode.InteractiveWebAssembly);
    }

    private async Task OnPersistingAsync() {
        if (_authenticationStateTask is null)             throw new UnreachableException($"Authentication state not set in {nameof(OnPersistingAsync)}().");

        var authenticationState = await _authenticationStateTask;
        var principal = authenticationState.User;

        if (principal.Identity?.IsAuthenticated == true) {
            var userId = principal.FindFirst(_options.ClaimsIdentity.UserIdClaimType)?.Value;
            var email = principal.FindFirst(_options.ClaimsIdentity.EmailClaimType)?.Value;
            var name = principal.FindFirst(ClaimTypes.GivenName)?.Value ?? "User";
            var role = principal.FindFirst(_options.ClaimsIdentity.RoleClaimType)?.Value ?? string.Empty;

            if (userId != null && email != null) {
                _state.PersistAsJson(nameof(BasicUserInfo), new BasicUserInfo {
                    Id = Guid.TryParse(userId, out var id) ? id : Guid.Empty,
                    DisplayName = name,
                    Email = email,
                    IsAdministrator = role == "Administrator",
                });
            }
        }
    }
    private void OnAuthenticationStateChanged(Task<AuthenticationState> authenticationStateTask) => _authenticationStateTask = authenticationStateTask;

    public void Dispose() {
        _authenticationStateTask?.Dispose();
        AuthenticationStateChanged -= OnAuthenticationStateChanged;
        _subscription.Dispose();
    }
}
