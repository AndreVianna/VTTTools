namespace VttTools.WebApp.Pages.Account;

public partial class LoginPage {
    [SupplyParameterFromQuery]
    internal string? ReturnUrl { get; set; }

    [SupplyParameterFromForm]
    private LoginInputModel Input { get; set; } = new();

    internal LoginPageState State => Handler.State;

    public Task LoginUser()
        => Handler.LoginUserAsync(Input, ReturnUrl);
}