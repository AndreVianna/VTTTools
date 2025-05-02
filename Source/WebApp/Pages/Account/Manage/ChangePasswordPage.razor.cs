namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ChangePasswordPage {
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ChangePasswordPage> Logger { get; set; } = null!;

    internal ChangePasswordPageState State => Handler.State;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await Handler.InitializeAsync(HttpContextAccessor.HttpContext!,
                                        UserManager,
                                        NavigationManager,
                                        SignInManager,
                                        UserAccessor,
                                        Logger);
    }

    private async Task OnValidSubmitAsync() => await Handler.ChangePasswordAsync();
}