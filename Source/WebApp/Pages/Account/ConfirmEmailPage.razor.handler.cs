namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : ComponentHandler<ConfirmEmailPageHandler, ConfirmEmailPage>(httpContext, navigationManager, loggerFactory) {
    public async Task<bool> ConfigureAsync(UserManager<User> userManager, string? userId, string? code) {
        if (userId is null || code is null)
            return false;

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
            return false;

        var decodedCode = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await userManager.ConfirmEmailAsync(user, decodedCode);
        return result.Succeeded;
    }
}