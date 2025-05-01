namespace VttTools.WebApp.Pages.Account.Manage;

public partial class EmailPage {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;
    [Inject]
    private ILogger<EmailPage> Logger { get; set; } = null!;

    internal EmailPageHandler Handler { get; } = new();

    internal EmailPageState State => Handler.State;

    protected override async Task OnInitializedAsync() => await Handler.TryInitializeAsync(
                                                                                           HttpContext,
                                                                                           UserManager,
                                                                                           NavigationManager,
                                                                                           UserAccessor,
                                                                                           EmailSender,
                                                                                           Logger);

    private async Task OnValidSubmitAsync() => await Handler.ChangeEmailAsync();

    private async Task OnSendEmailVerificationAsync() => await Handler.SendEmailVerificationAsync();
}