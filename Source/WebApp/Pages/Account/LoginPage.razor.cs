namespace VttTools.WebApp.Pages.Account;

public partial class LoginPage {
    [Inject]
    internal SignInManager<User> SignInManager { get; set; } = null!;

    [SupplyParameterFromQuery]
    internal string? ReturnUrl { get; set; }

    internal LoginPageState State => Handler.State;

    protected override async Task<bool> ConfigureComponentAsync() {
        await Handler.ConfigureAsync(UserManager, SignInManager);
        return true;
    }

    public Task LoginUser()
        => Handler.LoginUserAsync(ReturnUrl);
}