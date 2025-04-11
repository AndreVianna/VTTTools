using IAuthenticationService = WebApi.Services.IAuthenticationService;

namespace WebApi.Builders;

public class IdentityProviderWebApiBuilder<TBuilder, TUserDataStore, TUser>(string[] args)
    : IdentityProviderWebApiBuilder<TBuilder, IdentityProviderWebApiOptions, TUserDataStore, TUser>(args)
    where TBuilder : IdentityProviderWebApiBuilder<TBuilder, TUserDataStore, TUser>
    where TUserDataStore : class, IUserDataStore<TUser>
    where TUser : User, new();

public class IdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser>
    : WebApiBuilder<TBuilder, TOptions>
    where TBuilder : IdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser>
    where TOptions : IdentityProviderWebApiOptions<TOptions>, new()
    where TUserDataStore : class, IUserDataStore<TUser>
    where TUser : User, new() {
    public IdentityProviderWebApiBuilder(string[] args)
        : base(args) {
        Services.AddScoped<IUserDataStore<TUser>, TUserDataStore>();
        Services.AddScoped<IAuthenticationService, IdentityProviderService<TUser>>();
        Services.AddScoped<IAccountManagementTokenFactory<TUser>, AccountManagementTokenFactory<TUser>>();
        Services.AddSingleton<ITokenFactory, TokenFactory>();

        Services.AddIdentity<TUser, IdentityRole>(identityOptions => {
            identityOptions.SignIn.RequireConfirmedAccount = Options.AccountConfirmation.IsRequired;
            identityOptions.SignIn.RequireConfirmedEmail = Options.IdentifierType == UserIdentifierType.Email
                                                        || Options.AccountConfirmation is { IsRequired: true, Type: AccountConfirmationType.Email }
                                                        || Options.TwoFactorAuthentication is { IsRequired: true, Type: TwoFactorAuthenticationType.Email };
            identityOptions.SignIn.RequireConfirmedPhoneNumber = Options.TwoFactorAuthentication is { IsRequired: true, Type: TwoFactorAuthenticationType.Phone };
            identityOptions.User.RequireUniqueEmail = true;

            identityOptions.Password = Options.InternalSignIn.Password;
            identityOptions.Lockout = Options.InternalSignIn.Lockout;
            identityOptions.Stores.MaxLengthForKeys = 64;
            identityOptions.Stores.ProtectPersonalData = true;

            identityOptions.ClaimsIdentity.UserIdClaimType = Options.UserClaims.Id;
            identityOptions.ClaimsIdentity.UserNameClaimType = Options.UserClaims.Identifier;
            identityOptions.ClaimsIdentity.EmailClaimType = Options.UserClaims.Email;
            identityOptions.ClaimsIdentity.RoleClaimType = Options.UserClaims.Role;
            identityOptions.ClaimsIdentity.SecurityStampClaimType = Options.UserClaims.SecurityStamp;
        })
        .AddUserManager<TUser>()
        .AddDefaultTokenProviders();

        Services.AddAuthorization();
    }
}
