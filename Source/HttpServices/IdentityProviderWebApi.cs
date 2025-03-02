using AuthenticationService = HttpServices.Services.Authentication.AuthenticationService;
using IAuthenticationService = HttpServices.Services.Authentication.IAuthenticationService;

// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

public static class IdentityProviderWebApi {
    public static WebApiBuilder CreateBuilder(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        => CreateBuilder<IdentityProviderApiDbContext, User, NamedUserProfile>(args, configure);

    public static WebApiBuilder CreateBuilder<TDatabase, TUser, TProfile>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext
        where TUser : class, IIdentityUser<TProfile>, new()
        where TProfile : class, IUserProfile, new()
        => CreateBuilder<TDatabase, TUser, TProfile, Role>(args, configure);

    public static WebApiBuilder CreateBuilder<TDatabase, TUser, TProfile, TRole>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext
        where TUser : class, IIdentityUser<TProfile>, new()
        where TProfile : class, IUserProfile, new()
        where TRole : class {
        var builder = WebApi.CreateBuilder<TDatabase>(args, configure);

        builder.Services.Configure<ExtendedIdentityOptions>(builder.Configuration.GetSection("Identity"));
        builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
        builder.Services.AddScoped<IAccountService, AccountService>();
        builder.Services.AddScoped<IMessagingService<TUser>, MessagingService<TUser, TProfile>>();
        builder.Services.AddScoped<IEmailSender<TUser>, NullEmailSender<TUser>>();

        builder.Services.AddSingleton<IPersonalDataProtector, NullPersonalDataProtector>();
        builder.Services.AddDataProtection();
        builder.Services.AddIdentity<TUser, TRole>(options => {
            options.SignIn.RequireConfirmedAccount = true;
            options.Stores.SchemaVersion = IdentitySchemaVersions.Version2;
            options.Stores.MaxLengthForKeys = 48;
            options.Stores.ProtectPersonalData = false;
            options.SignIn.RequireConfirmedAccount = true;
            options.SignIn.RequireConfirmedEmail = true;
            options.User.RequireUniqueEmail = true;
            options.Password.RequiredLength = 8;
            options.Password.RequiredUniqueChars = 4;
        }).AddEntityFrameworkStores<TDatabase>()
        .AddSignInManager()
        .AddDefaultTokenProviders();

        return builder;
    }
}
