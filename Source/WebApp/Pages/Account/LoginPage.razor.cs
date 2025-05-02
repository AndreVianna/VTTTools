namespace VttTools.WebApp.Pages.Account;

public partial class LoginPage {
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;

    [Inject]
    private ILogger<LoginPage> Logger { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    internal LoginPageState State => Handler.State;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await Handler.InitializeAsync(HttpContext, UserManager, SignInManager, NavigationManager, Logger);
    }

    public async Task LoginUser() => await Handler.LoginUserAsync(ReturnUrl);
}