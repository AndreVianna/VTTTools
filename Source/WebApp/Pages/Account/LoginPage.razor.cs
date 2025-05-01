namespace VttTools.WebApp.Pages.Account;

public partial class LoginPage {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private ILogger<LoginPage> Logger { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    internal LoginPageHandler Handler { get; } = new();

    internal LoginPageState State => Handler.State;

    protected override async Task OnInitializedAsync() => await Handler.InitializeAsync(
                                                                                        HttpContext,
                                                                                        UserManager,
                                                                                        SignInManager,
                                                                                        NavigationManager,
                                                                                        Logger);

    public async Task LoginUser() => await Handler.LoginUserAsync(ReturnUrl);
}