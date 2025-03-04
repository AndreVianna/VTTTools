﻿namespace WebApp.Components.Account.Pages;

public partial class RegisterConfirmation {
    private string? _emailConfirmationLink;
    private string? _statusMessage;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? Email { get; set; }

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    protected override async Task OnInitializedAsync() {
        if (Email is null)
            RedirectManager.RedirectTo("");

        var user = await UserManager.FindByEmailAsync(Email);
        if (user is null) {
            HttpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            _statusMessage = "Error finding user for unspecified email";
        }
        else if (EmailSender is IEmailSender<User>) {
            // Once you add a real email sender, you should remove this code that lets you confirm the account
            var userId = await UserManager.GetUserIdAsync(user);
            var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            _emailConfirmationLink = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("Account/ConfirmEmail")
                                                                                                 .AbsoluteUri,
                                                                                new Dictionary<string, object?> {
                                                                                    ["userId"] = userId,
                                                                                    ["code"] = code,
                                                                                    ["returnUrl"] = ReturnUrl
                                                                                });
        }
    }
}
