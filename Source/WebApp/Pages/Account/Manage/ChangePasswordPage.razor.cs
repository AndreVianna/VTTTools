namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ChangePasswordPage {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ChangePasswordPage> Logger { get; set; } = null!;

    internal ChangePasswordPageHandler Handler { get; } = new();

    internal ChangePasswordPageState State => Handler.State;

    protected override async Task OnInitializedAsync()
        => await Handler.TryInitializeAsync(HttpContext,
                                                                                           UserManager,
                                                                                           NavigationManager,
                                                                                           SignInManager,
                                                                                           UserAccessor,
                                                                                           Logger);

    private async Task OnValidSubmitAsync() => await Handler.ChangePasswordAsync();
}