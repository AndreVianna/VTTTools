namespace WebApi.Options;

public interface IIdentityProviderWebApiOptions
    : IIdentityProviderWebApiOptions<IdentityProviderWebApiOptions>;

public interface IIdentityProviderWebApiOptions<out TOptions>
    : IBasicWebApiOptions
    where TOptions : IdentityProviderWebApiOptions<TOptions>, new() {
    UserClaimsOptions Claims { get; set; }
    LockoutOptions Lockout { get; set; }
    MasterIdentityOptions? Master { get; set; }
    PasswordOptions Password { get; set; }

    bool RequiresConfirmedAccount { get; set; }
    TemporaryTokenOptions AccountConfirmationToken { get; set; }
    bool RequiresTwoFactorAuthentication { get; set; }
    TwoFactorTokenOptions TwoFactorToken { get; set; }
    AccessTokenOptions UserAccessToken { get; }
}
