namespace VttTools.WebApp.Pages.Account;

internal class LoginPageState {
    public bool HasExternalLoginProviders { get; set; }
    public LoginInputModel Input { get; set; } = new();
    public string? ErrorMessage { get; set; }
}