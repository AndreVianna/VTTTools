namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    [SupplyParameterFromQuery]
    internal string? UserId { get; set; }

    [SupplyParameterFromQuery]
    internal string? Code { get; set; }

    protected override async Task<bool> ConfigureComponentAsync() {
        HttpContext.SetStatusMessage("The email confirmation code is invalid, please try again.");
        var isConfirmed = await Handler.ConfigureAsync(UserManager, UserId, Code);
        if (!isConfirmed) return false;
        HttpContext.SetStatusMessage("Thank you for confirming your email.");
        return true;
    }

    internal void GoToSignInPage()
        => NavigationManager.GoToSigIn();
}