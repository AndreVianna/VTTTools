namespace WebApi.Tokens;

public class AccountManagementTokenFactory<TUser>(UserManager<TUser> userManager, TimeProvider clock)
    : TokenFactory(clock)
    , IAccountManagementTokenFactory<TUser>
    where TUser : User {
    public async Task<TemporaryToken> CreateTwoFactorToken(TUser user, TwoFactorAuthenticationOptions options) {
        var value = await userManager.GenerateTwoFactorTokenAsync(user, options.Type.ToString());
        return CreateTemporaryToken(options.Token, AccountManagementTokenType.TwoFactor, value);
    }

    public async Task<TemporaryToken> CreateAccountConfirmationToken(TUser user, AccountConfirmationOptions options) {
        var value = await userManager.GenerateEmailConfirmationTokenAsync(user);
        return CreateTemporaryToken(options.Token, AccountManagementTokenType.AccountConfirmation, value);
    }
}