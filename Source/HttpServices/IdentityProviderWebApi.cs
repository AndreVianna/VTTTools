using HttpServices.Accounts;

using AuthenticationService = HttpServices.Identity.AuthenticationService;
using IAuthenticationService = HttpServices.Identity.IAuthenticationService;

// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

public static class IdentityProviderWebApi {
    public static WebApiBuilder CreateBuilder(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        => CreateBuilder<IdentityProviderApiDbContext, UserIdentity>(args, configure);

    public static WebApiBuilder CreateBuilder<TDatabase, TUser>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext
        where TUser : class, IUserIdentity, new()
        => CreateBuilder<TDatabase, TUser, Role>(args, configure);

    public static WebApiBuilder CreateBuilder<TDatabase, TUser, TRole>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext
        where TUser : class, IUserIdentity, new()
        where TRole : class {
        var builder = WebApi.CreateBuilder<TDatabase>(args, configure);

        builder.Services.Configure<AuthenticationServiceOptions>(builder.Configuration.GetSection("Identity"));
        builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
        builder.Services.AddScoped<IAccountService, AccountService>();
        builder.Services.AddScoped<IMessagingService<TUser>, MessagingService<TUser>>();
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
