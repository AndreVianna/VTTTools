namespace VttTools.WebApp.Extensions;

internal static class UserManagerExtensions {
    public static async Task<string> GetCurrentUserDisplayNameAsync(this UserManager<User> userManager, HttpContext httpContext) {
        var user = await userManager.GetUserAsync(httpContext.User);
        return user?.DisplayName ?? user?.Name ?? string.Empty;
    }
    public static async Task<Guid> GetCurrentUserIdAsync(this UserManager<User> userManager, HttpContext httpContext) {
        var user = await userManager.GetUserAsync(httpContext.User);
        return user?.Id ?? Guid.Empty;
    }

    public static async Task<bool> CurrentUserIsAdministratorAsync(this UserManager<User> userManager, HttpContext httpContext) {
        var user = await userManager.GetUserAsync(httpContext.User);
        return user is not null && await userManager.IsInRoleAsync(user, "Administrator");
    }
}