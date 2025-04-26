namespace VttTools.WebApp.Components.Account;

public partial class ManageNavMenuComponent {
    private bool _hasExternalLogins;

    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;

    protected override async Task OnInitializedAsync() => _hasExternalLogins = (await SignInManager.GetExternalAuthenticationSchemesAsync()).Any();
}