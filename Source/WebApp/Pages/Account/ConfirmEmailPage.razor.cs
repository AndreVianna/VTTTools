namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    [SupplyParameterFromQuery]
    internal string? UserId { get; set; }

    [SupplyParameterFromQuery]
    internal string? Code { get; set; }

    protected override Task<bool> ConfigureComponentAsync()
        => Handler.ConfigureAsync(UserManager, UserId, Code);

    internal void GoToSignInPage()
        => NavigationManager.GoToSignIn();
}