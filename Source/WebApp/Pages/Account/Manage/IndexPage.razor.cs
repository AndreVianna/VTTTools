namespace VttTools.WebApp.Pages.Account.Manage;

public partial class IndexPage {
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<IndexPage> Logger { get; set; } = null!;

    internal IndexPageState State => Handler.State;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await Handler.TryInitializeAsync(
            HttpContextAccessor.HttpContext!,
            UserManager,
            SignInManager,
            NavigationManager,
            UserAccessor,
            Logger);
    }

    private async Task OnValidSubmitAsync() => await Handler.UpdateProfileAsync();
}