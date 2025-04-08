namespace WebApi.Options;

public record IdentityProviderWebApiOptions
    : IdentityProviderWebApiOptions<IdentityProviderWebApiOptions>
    , IIdentityProviderWebApiOptions;

public record IdentityProviderWebApiOptions<TOptions>
    : BasicWebApiOptions<TOptions>
    , IIdentityProviderWebApiOptions<TOptions>
    where TOptions : IdentityProviderWebApiOptions<TOptions>, new() {
    public UserClaimsOptions Claims { get; set; } = new();
    public LockoutOptions Lockout { get; set; } = new();
    public MasterIdentityOptions? Master { get; set; }
    public PasswordOptions Password { get; set; } = new();
    public bool RequiresConfirmedAccount { get; set; }
    public TemporaryTokenOptions AccountConfirmationToken { get; set; } = new();
    public bool RequiresTwoFactorAuthentication { get; set; }
    public TwoFactorTokenOptions TwoFactorToken { get; set; } = new();
    public AccessTokenOptions UserAccessToken { get; set; } = new();
}
