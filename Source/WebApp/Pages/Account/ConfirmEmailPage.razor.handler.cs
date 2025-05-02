namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandler {
    internal ConfirmEmailPageState State { get; } = new();

    public async Task InitializeAsync(UserManager<User> userManager, string? userId, string? code) {
        if (userId is null || code is null) return;

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return;

        var decodedCode = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await userManager.ConfirmEmailAsync(user, decodedCode);
        if (!result.Succeeded) return;

        State.IsConfirmed = true;
    }
}