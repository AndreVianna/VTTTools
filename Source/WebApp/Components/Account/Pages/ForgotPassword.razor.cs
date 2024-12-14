using System.Text.Encodings.Web;

namespace WebApp.Components.Account.Pages;

public partial class ForgotPassword {
    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    private async Task OnValidSubmitAsync() {
        var user = await UserManager.FindByEmailAsync(Input.Email);
        if (user is null || !await UserManager.IsEmailConfirmedAsync(user))
            RedirectManager.RedirectTo("Account/ForgotPasswordConfirmation");

        var code = await UserManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var uri = NavigationManager.ToAbsoluteUri("Account/ResetPassword").AbsoluteUri;
        var parameters = new Dictionary<string, object?> { ["code"] = code };
        var callbackUrl = NavigationManager.GetUriWithQueryParameters(uri, parameters);

        await EmailSender.SendPasswordResetLinkAsync(user, Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        RedirectManager.RedirectTo("Account/ForgotPasswordConfirmation");
    }

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";
    }
}
