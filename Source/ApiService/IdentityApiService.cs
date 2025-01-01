// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

public static class IdentityApiService {
    public static WebApplicationBuilder CreateBuilder<TDatabase, TUser, TRole>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
        where TDatabase : DbContext
        where TUser : class
        where TRole : class {
        var builder = ApiService.CreateBuilder<TDatabase>(args, configure);

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
