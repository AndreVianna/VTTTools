// ReSharper disable once CheckNamespace

using AuthenticationService = HttpServices.Services.Authentication.AuthenticationService;
using IAuthenticationService = HttpServices.Services.Authentication.IAuthenticationService;

namespace Microsoft.Extensions.Hosting;
public static class IdentityProviderWebApi {
    public static WebApiBuilder CreateBuilder(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        => CreateBuilder<IdentityProviderApiDbContext, NamedUser, Role>(args, configure);

    public static WebApiBuilder CreateBuilder<TDatabase>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext => CreateBuilder<TDatabase, NamedUser, Role>(args, configure);

    public static WebApiBuilder CreateBuilder<TDatabase, TUser, TRole>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext
        where TUser : class, IUserIdentity
        where TRole : class {
        var builder = WebApi.CreateBuilder<TDatabase>(args, configure);

        builder.Services.Configure<ExtendedIdentityOptions>(builder.Configuration.GetSection("Identity"));
        builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
        builder.Services.AddScoped<IAccountService, AccountService>();
        builder.Services.AddScoped<IMessagingService, MessagingService>();
        builder.Services.AddScoped<IEmailSender, NullEmailSender>();

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
