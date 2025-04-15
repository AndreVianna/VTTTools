namespace WebApp.Components.Account.Shared;

public partial class ExternalLoginPicker {
    private AuthenticationScheme[] _externalLogins = [];

    [Inject]
    protected SignInManager<User> SignInManager { get; init; } = null!;

    [Inject]
    protected IdentityRedirectManager RedirectManager { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    protected override async Task OnInitializedAsync() {
        var schemes = await SignInManager.GetExternalAuthenticationSchemesAsync();
        _externalLogins = [..schemes];
    }
}
