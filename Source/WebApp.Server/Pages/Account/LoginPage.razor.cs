namespace VttTools.WebApp.Server.Pages.Account;

public partial class LoginPage {
    [SupplyParameterFromQuery]
    internal string? ReturnUrl { get; set; }

    [SupplyParameterFromForm]
    internal LoginPageInput Input { get; set; } = new();

    internal LoginPageState State { get; set; } = new();

    public Task LoginUser()
        => Handler.LoginUserAsync(Input, ReturnUrl);
}