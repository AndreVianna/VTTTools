namespace VttTools.WebApp.Server.Pages.Account;

public class ConfirmEmailPageHandler(ConfirmEmailPage page)
    : PageHandler<ConfirmEmailPageHandler, ConfirmEmailPage>(page) {
    public async Task VerifyAsync(string? userId, string? code) {
        if (userId is null || code is null) {
            Page.SetStatusMessage("The email confirmation code is missing, please try again.");
            Page.GoHome();
            return;
        }

        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByIdAsync(userId);
        if (user is null) {
            Page.SetStatusMessage("The email confirmation code is invalid, please try again.");
            Page.GoHome();
            return;
        }

        var decodedCode = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await userManager.ConfirmEmailAsync(user, decodedCode);
        if (result.Succeeded) return;

        Page.SetStatusMessage("The email confirmation code is invalid, please try again.");
        Page.GoHome();
    }
}