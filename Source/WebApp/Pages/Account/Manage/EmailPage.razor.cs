namespace VttTools.WebApp.Pages.Account.Manage;

public partial class EmailPage {
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;
    [Inject]
    private ILogger<EmailPage> Logger { get; set; } = null!;

    internal EmailPageState State => Handler.State;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await Handler.TryInitializeAsync(
            HttpContextAccessor.HttpContext!,
            UserManager,
            NavigationManager,
            UserAccessor,
            EmailSender,
            Logger);
    }

    private async Task OnValidSubmitAsync() => await Handler.ChangeEmailAsync();

    private async Task OnSendEmailVerificationAsync() => await Handler.SendEmailVerificationAsync();
}