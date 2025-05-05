namespace VttTools.WebApp.Pages.Account;

internal class LoginPageState {
    public bool HasExternalLoginProviders { get; set; }
    public LoginPageInputModel Input { get; set; } = new();
    public string? ErrorMessage { get; set; }
}