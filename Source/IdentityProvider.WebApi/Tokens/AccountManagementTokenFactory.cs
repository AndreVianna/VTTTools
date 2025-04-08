namespace WebApi.Tokens;

public class AccountManagementTokenFactory<TUser>(UserManager<TUser> userManager, TimeProvider clock)
    : TokenFactory(clock)
    , IAccountManagementTokenFactory<TUser>
    where TUser : User {
    public async Task<TemporaryToken> CreateTwoFactorToken(TUser user, TwoFactorTokenOptions options) {
        var value = await userManager.GenerateTwoFactorTokenAsync(user, options.Type.ToString());
        return CreateTemporaryToken(options, AccountManagementTokenType.TwoFactor, value);
    }

    public async Task<TemporaryToken> CreateAccountConfirmationToken(TUser user, TemporaryTokenOptions options) {
        var value = await userManager.GenerateEmailConfirmationTokenAsync(user);
        return CreateTemporaryToken(options, AccountManagementTokenType.AccountConfirmation, value);
    }
}