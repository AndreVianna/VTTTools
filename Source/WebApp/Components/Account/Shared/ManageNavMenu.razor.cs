namespace VttTools.WebApp.Components.Account.Shared;

public partial class ManageNavMenu {
    private bool _hasExternalLogins;

    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;

    protected override async Task OnInitializedAsync() => _hasExternalLogins = (await SignInManager.GetExternalAuthenticationSchemesAsync()).Any();
}