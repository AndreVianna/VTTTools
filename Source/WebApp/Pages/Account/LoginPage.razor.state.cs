namespace VttTools.WebApp.Pages.Account;

internal class LoginPageState {
    public string? ErrorMessage { get; set; }
    public bool HasExternalLoginProviders { get; set; }
    public LoginPageInputModel Input { get; set; } = new();
}