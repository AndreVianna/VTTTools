namespace WebApp.Components.Account.Shared;

public partial class ManageNavMenu {
    private bool _hasExternalLogins;

    protected override async Task OnInitializedAsync() => _hasExternalLogins = (await SignInManager.GetExternalAuthenticationSchemesAsync()).Any();
}
