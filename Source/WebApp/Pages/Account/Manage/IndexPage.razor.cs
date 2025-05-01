namespace VttTools.WebApp.Pages.Account.Manage;

public partial class IndexPage {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<IndexPage> Logger { get; set; } = null!;

    internal IndexPageHandler Handler { get; } = new();

    internal IndexPageState State => Handler.State;

    protected override async Task OnInitializedAsync()
        => await Handler.TryInitializeAsync(HttpContext,
                                                                                           UserManager,
                                                                                           SignInManager,
                                                                                           NavigationManager,
                                                                                           UserAccessor,
                                                                                           Logger);

    private async Task OnValidSubmitAsync() => await Handler.UpdateProfileAsync();
}