using IResult = Microsoft.AspNetCore.Http.IResult;

namespace IdentityService.Handlers.Account;

internal sealed class UserAccountHandler(UserManager<User> userManager,
                                         IContactHandler contactHandler,
                                         ILogger<UserAccountHandler> logger)
    : IUserAccountHandler {
    public static async Task<IResult> FindByEmailAsync(IUserAccountHandler handler, string email) {
        var response = await handler.FindAsync(null, email);
        return response is not null ? Results.Ok(response)
             : Results.NotFound();
    }

    public static async Task<IResult> FindByIdAsync(IUserAccountHandler handler, string id) {
        var response = await handler.FindAsync(id, null);
        return response is not null ? Results.Ok(response)
             : Results.NotFound();
    }

    public static async Task<IResult> RegisterAsync(IUserAccountHandler handler, RegisterUserRequest request) {
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
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.Errors;

        var user = new User { Name = request.Name };
        await userManager.SetUserNameAsync(user, request.Email);
        await userManager.SetEmailAsync(user, request.Email);
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded) {
            return result.Errors.ToArray(e => new ValidationError(e.Description, GetSource(e.Code)));
        }

        logger.LogInformation("User created a new account with password.");

        var response = new RegisterUserResponse {
            UserId = await userManager.GetUserIdAsync(user),
            RequiresConfirmation = userManager.Options.SignIn.RequireConfirmedAccount,
        };
        await SendConfirmationEmail(request, user);

        return response;
    }

    private static string GetSource(string code)
        => code switch {
            _ when code.StartsWith("Duplicate") => "Email",
            _ when code.StartsWith("Password") => "Password",
            _ => "",
        };

    private async Task SendConfirmationEmail(RegisterUserRequest request, User user) {
        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        await contactHandler.SendConfirmationEmailAsync(user, code, request.ConfirmationUrl, request.ReturnUrl);
    }
}