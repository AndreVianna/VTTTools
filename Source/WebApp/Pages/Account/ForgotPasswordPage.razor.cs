namespace VttTools.WebApp.Pages.Account;

public partial class ForgotPasswordPage {
    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    internal ForgotPasswordPageHandler Handler { get; } = new();

    internal ForgotPasswordPageState State => Handler.State;

    protected override void OnInitialized() => Handler.Initialize(UserManager, NavigationManager, EmailSender);

    private async Task OnValidSubmitAsync() => await Handler.RequestPasswordResetAsync();
}