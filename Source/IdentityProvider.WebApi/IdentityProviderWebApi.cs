// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

/// <summary>
/// Provides static factory methods for creating and configuring an Identity Provider Web API application builder (<see cref="IdentityProviderWebApiBuilder"/>).
/// Includes setup for ASP.NET Core Identity, user/role management services, data stores, and authentication.
/// </summary>
public static class IdentityProviderWebApi {
    /// <summary>
    /// Creates a new instance of <see cref="IdentityProviderWebApiBuilder"/> using specified data store, user, and role types,
    /// and default options (<see cref="IdentityProviderWebApiOptions"/>).
    /// </summary>
    /// <typeparam name="TIdentityDataStore">The type of the identity data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model.</typeparam>
    /// <typeparam name="TRole">The type of the role model.</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <returns>A configured <see cref="IdentityProviderWebApiBuilder"/> instance.</returns>
    public static IdentityProviderWebApiBuilder CreateBuilder<TIdentityDataStore, TUser, TRole>(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null)
        where TIdentityDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role
        => CreateBuilder<IdentityProviderWebApiBuilder, IdentityProviderWebApiOptions, TIdentityDataStore, TUser, TRole>(args, setup);

    /// <summary>
    /// Creates a new instance of a specific builder type <typeparamref name="TBuilder"/> with specific options <typeparamref name="TOptions"/>
    /// and specified data store, user, and role types. This is the core factory method.
    /// </summary>
    /// <typeparam name="TBuilder">The type of the builder, inheriting from <see cref="IdentityProviderWebApiBuilder{TBuilder, TOptions}"/>.</typeparam>
    /// <typeparam name="TOptions">The type of the options record.</typeparam>
    /// <typeparam name="TIdentityDataStore">The type of the identity data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model.</typeparam>
    /// <typeparam name="TRole">The type of the role model.</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <typeparamref name="TBuilder"/> instance.</returns>
    public static TBuilder CreateBuilder<TBuilder, TOptions, TIdentityDataStore, TUser, TRole>(string[] args, Action<TBuilder>? setup = null)
        where TBuilder : IdentityProviderWebApiBuilder<TBuilder, TOptions>
        where TOptions : IdentityProviderWebApiOptions<TOptions>, new()
        where TIdentityDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role {
        var builder = BasicWebApi.CreateBuilder<TBuilder, TOptions>(args);
        ApplyAdditionalSetup<TOptions, TIdentityDataStore, TUser, TRole>(builder, builder.Options);
        setup?.Invoke(builder);
        return builder;
    }

    private static void ApplyAdditionalSetup<TOptions, TIdentityDataStore, TUser, TRole>(IHostApplicationBuilder builder, TOptions options)
        where TOptions : IdentityProviderWebApiOptions<TOptions>, new()
        where TIdentityDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role {
        builder.Services.AddScoped<IIdentityDataStore<TUser>, TIdentityDataStore>();
        builder.Services.AddScoped<IIdentityManagementService, IdentityProviderService>();
        builder.Services.AddScoped<IAccountManagementTokenFactory<TUser>, AccountManagementTokenFactory<TUser>>();

        builder.Services.AddIdentity<TUser, TRole>(identityOptions => {
            identityOptions.SignIn.RequireConfirmedAccount = options.RequiresConfirmedAccount;
            identityOptions.SignIn.RequireConfirmedEmail = options.RequiresConfirmedAccount;
            identityOptions.SignIn.RequireConfirmedPhoneNumber = options.RequiresTwoFactorAuthentication;
            identityOptions.User.RequireUniqueEmail = true;

            identityOptions.Password = options.Password;
            identityOptions.Lockout = options.Lockout;
            identityOptions.Stores.MaxLengthForKeys = 64;
            identityOptions.Stores.ProtectPersonalData = true;

            identityOptions.ClaimsIdentity.UserIdClaimType = options.Claims.Id;
            identityOptions.ClaimsIdentity.UserNameClaimType = options.Claims.Identifier;
            identityOptions.ClaimsIdentity.EmailClaimType = options.Claims.Email;
            identityOptions.ClaimsIdentity.RoleClaimType = options.Claims.Role;
            identityOptions.ClaimsIdentity.SecurityStampClaimType = options.Claims.SecurityStamp;
        })
        .AddUserManager<TUser>()
        .AddDefaultTokenProviders();

        builder.Services.AddAuthorization();
    }

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model.</typeparam>
    /// <typeparam name="TRole">The type of the role model.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build<TTenantDataStore, TUser, TRole>(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TTenantDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role
        => Build<IdentityProviderWebApiBuilder, IdentityProviderWebApiOptions, TTenantDataStore, TUser, TRole>(args, setup, configure);

    /// <summary>
    /// Creates and configures a web application for multi-tenant scenarios using specified builder and options.
    /// </summary>
    /// <typeparam name="TBuilder">Specifies the type of builder used to create the web application.</typeparam>
    /// <typeparam name="TOptions">Defines the options that configure the behavior of the multi-tenant web application.</typeparam>
    /// <typeparam name="TTenantDataStore">Represents the data store that manages tenant-specific data.</typeparam>
    /// <typeparam name="TUser">The type of the user model.</typeparam>
    /// <typeparam name="TRole">The type of the role model.</typeparam>
    /// <param name="args">Contains command-line arguments for configuring the application at startup.</param>
    /// <param name="setup">Allows for additional setup actions to be performed on the builder before the application is built.</param>
    /// <param name="configure">Enables further configuration of the web application after it has been built.</param>
    /// <returns>Returns the configured web application instance ready for use.</returns>
    public static WebApplication Build<TBuilder, TOptions, TTenantDataStore, TUser, TRole>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : IdentityProviderWebApiBuilder<TBuilder, TOptions>
        where TOptions : IdentityProviderWebApiOptions<TOptions>, new()
        where TTenantDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role {
        var builder = CreateBuilder<TBuilder, TOptions, TTenantDataStore, TUser, TRole>(args, setup);
        return builder.Build(configure);
    }

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model.</typeparam>
    /// <typeparam name="TRole">The type of the role model.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run<TTenantDataStore, TUser, TRole>(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TTenantDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role
        => Build<TTenantDataStore, TUser, TRole>(args, setup, configure).Run();

    /// <summary>
    /// Executes the application with specified tenant configurations and optional setup or configuration actions.
    /// </summary>
    /// <typeparam name="TBuilder">Defines the type responsible for building the multi-tenant web API.</typeparam>
    /// <typeparam name="TOptions">Specifies the options that configure the multi-tenant behavior of the web API.</typeparam>
    /// <typeparam name="TTenantDataStore">Represents the data store used to manage tenant-specific data.</typeparam>
    /// <typeparam name="TUser">The type of the user model.</typeparam>
    /// <typeparam name="TRole">The type of the role model.</typeparam>
    /// <param name="args">Contains the command-line arguments passed to the application.</param>
    /// <param name="setup">Allows for custom setup actions to be performed on the builder before running the application.</param>
    /// <param name="configure">Enables additional configuration of the web application before it starts.</param>
    public static void Run<TBuilder, TOptions, TTenantDataStore, TUser, TRole>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : IdentityProviderWebApiBuilder<TBuilder, TOptions>
        where TOptions : IdentityProviderWebApiOptions<TOptions>, new()
        where TTenantDataStore : class, IIdentityDataStore<TUser>
        where TUser : User
        where TRole : Role
        => Build<TBuilder, TOptions, TTenantDataStore, TUser, TRole>(args, setup, configure).Run();
}