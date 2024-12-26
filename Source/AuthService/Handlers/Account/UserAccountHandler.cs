using Domain.Contracts.Account;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace AuthService.Handlers.Account;

internal class UserAccountHandler(UserManager<ApplicationUser> userManager,
                                  IEmailSender<ApplicationUser> emailSender,
                                  NavigationManager navigationManager,
                                  ILogger<UserAccountHandler> logger)
    : IUserAccountHandler {
    [Authorize]
    public static async Task<IResult> FindUserByEmailAsync(UserAccountHandler handler, string email) {
        var response = await handler.FindAsync(null, email);
        return response is not null ? Results.Ok(response)
             : Results.NotFound();
    }

    public static async Task<IResult> FindByIdAsync(UserAccountHandler handler, string id) {
        var response = await handler.FindAsync(id, null);
        return response is not null ? Results.Ok(response)
             : Results.NotFound();
    }

    public static async Task<IResult> RegisterAsync(UserAccountHandler handler, RegisterUserRequest request) {
        var response = await handler.CreateAsync(request);
        return response.IsSuccess ? Results.Ok(response.Value)
             : Results.BadRequest(response.Errors);
    }

    public async Task<FindUserResponse?> FindAsync(string? id, string? email) {
        var user = id is not null ? await userManager.FindByIdAsync(id)
                 : email is not null ? await userManager.FindByEmailAsync(email)
                 : null;
        return user == null ? null
             : new() {
                 Id = await userManager.GetUserIdAsync(user),
                 Email = (await userManager.GetEmailAsync(user))!,
                 EmailConfirmed = await userManager.IsEmailConfirmedAsync(user),
                 PhoneNumber = await userManager.GetPhoneNumberAsync(user),
                 PhoneNumberConfirmed = await userManager.IsPhoneNumberConfirmedAsync(user),
                 TwoFactorEnabled = await userManager.GetTwoFactorEnabledAsync(user),
                 LockoutEnabled = await userManager.GetLockoutEnabledAsync(user),
                 LockoutEnd = await userManager.GetLockoutEndDateAsync(user),
                 AccessFailedCount = await userManager.GetAccessFailedCountAsync(user),
                 Name = user.Name!,
                 PreferredName = user.PreferredName,
             };
    }

    public async Task<Result<RegisterUserResponse>> CreateAsync(RegisterUserRequest request) {
        var user = new ApplicationUser();
        await userManager.SetUserNameAsync(user, request.Email);
        await userManager.SetEmailAsync(user, request.Email);
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return result.Errors.ToArray(e => new ValidationError($"{e.Code}: {e.Description}"));

        logger.LogInformation("User created a new account with password.");

        var response = new RegisterUserResponse {
            UserId = await userManager.GetUserIdAsync(user),
            RequiresConfirmation = userManager.Options.SignIn.RequireConfirmedAccount,
        };
        await SendConfirmationEmail(request, response.UserId, user);

        return response;
    }

    private async Task SendConfirmationEmail(RegisterUserRequest request, string userId, ApplicationUser user) {
        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var uri = navigationManager.ToAbsoluteUri("Account/ConfirmEmail").AbsoluteUri;
        var parameters = new Dictionary<string, object?> {
            ["userId"] = userId,
            ["code"] = code,
            ["returnUrl"] = request.ReturnUrl
        };
        var callbackUrl = navigationManager.GetUriWithQueryParameters(uri, parameters);
        await emailSender.SendConfirmationLinkAsync(user, request.Email, HtmlEncoder.Default.Encode(callbackUrl));
    }
}