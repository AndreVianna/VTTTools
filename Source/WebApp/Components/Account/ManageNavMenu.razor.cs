namespace VttTools.WebApp.Components.Account;

public partial class ManageNavMenu
{
    [Inject]
    internal SignInManager<User> SignInManager { get; set; } = null!;

    internal bool HasExternalLogins { get; private set; }

    protected override async Task OnInitializedAsync()
    {
        await base.OnInitializedAsync();
        HasExternalLogins = (await SignInManager.GetExternalAuthenticationSchemesAsync()).Any();
    }
}
