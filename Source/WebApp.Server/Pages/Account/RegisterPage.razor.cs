namespace VttTools.WebApp.Pages.Account;

public partial class RegisterPage {
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    internal RegisterPageState State { get; set; } = new();

    public async Task RegisterUser(EditContext _) {
        await Handler.RegisterUserAsync(ReturnUrl);
        await StateHasChangedAsync();
    }
}