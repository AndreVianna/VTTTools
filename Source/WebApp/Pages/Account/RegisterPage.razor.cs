namespace VttTools.WebApp.Pages.Account;

public partial class RegisterPage {
    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private IUserStore<User> UserStore { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;
    [Inject]
    private ILogger<RegisterPage> Logger { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    internal RegisterPageHandler Handler { get; } = new();

    internal RegisterPageState State => Handler.State;

    protected override async Task OnInitializedAsync() => await Handler.InitializeAsync(
            UserManager,
            UserStore,
            SignInManager,
            NavigationManager,
            EmailSender,
            Logger);

    public async Task RegisterUser(EditContext _) => await Handler.RegisterUserAsync(ReturnUrl);
}