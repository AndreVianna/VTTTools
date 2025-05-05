namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : PublicComponentHandler<ConfirmEmailPageHandler>(httpContext, navigationManager, loggerFactory) {
    public async Task<bool> ConfigureAsync(UserManager<User> userManager, string? userId, string? code) {
        if (userId is null || code is null) {
            HttpContext.SetStatusMessage("The email confirmation code is missing, please try again.");
            NavigationManager.GoHome();
            return false;
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) {
            HttpContext.SetStatusMessage("The email confirmation code is invalid, please try again.");
            NavigationManager.GoHome();
            return false;
        }

        var decodedCode = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await userManager.ConfirmEmailAsync(user, decodedCode);
        if (result.Succeeded)
            return true;

        HttpContext.SetStatusMessage("The email confirmation code is invalid, please try again.");
        NavigationManager.GoHome();
        return false;
    }
}