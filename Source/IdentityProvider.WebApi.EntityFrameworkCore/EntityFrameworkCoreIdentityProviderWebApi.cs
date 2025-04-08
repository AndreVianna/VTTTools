// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

/// <summary>
/// Provides static factory methods for creating and configuring an Identity Provider Web API application builder (<see cref="IdentityProviderWebApiBuilder"/>).
/// Includes setup for ASP.NET Core Identity, user/role management services, data stores, and authentication.
/// </summary>
public static class EntityFrameworkCoreIdentityProviderWebApi {
    /// <summary>
    /// Creates a new instance of <see cref="IdentityProviderWebApiBuilder"/> using specified data store and tenant types,
    /// and default options (<see cref="IdentityProviderWebApiOptions"/>).
    /// </summary>
    /// <typeparam name="TDataStore">The type of the identity data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model</typeparam>
    /// <typeparam name="TUserEntity">The type of the user entity</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <see cref="IdentityProviderWebApiBuilder"/> instance.</returns>
    public static IdentityProviderWebApiBuilder CreateBuilder<TDataStore, TUser, TUserEntity>(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null)
        where TDataStore : IdentityDataStore<TDataStore, TUser, TUserEntity>
        where TUser : User, new()
        where TUserEntity : UserEntity, new() {
        var builder = IdentityProviderWebApi.CreateBuilder<TDataStore, TUser, Role>(args, setup);
        builder.Services.AddSingleton<IIdentityMapper<TUser, TUserEntity>, IdentityMapper<TUser, TUserEntity>>();
        return builder;
    }

    /// <summary>
    /// Creates a new instance of <see cref="IdentityProviderWebApiBuilder"/> using specified data store, user, and role types,
    /// and default options (<see cref="IdentityProviderWebApiOptions"/>).
    /// </summary>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <returns>A configured <see cref="IdentityProviderWebApiBuilder"/> instance.</returns>
    public static IdentityProviderWebApiBuilder CreateBuilder(string[] args)
        => CreateBuilder<IdentityDataStore, User, UserEntity>(args);

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model</typeparam>
    /// <typeparam name="TUserEntity">The type of the user entity</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build<TDataStore, TUser, TUserEntity>(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TDataStore : IdentityDataStore<TDataStore, TUser, TUserEntity>
        where TUser : User, new()
        where TUserEntity : UserEntity, new()
        => IdentityProviderWebApi.Build<TDataStore, TUser, Role>(args, setup, configure);

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<IdentityDataStore, User, UserEntity>(args, setup, configure);

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model</typeparam>
    /// <typeparam name="TUserEntity">The type of the user entity</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run<TDataStore, TUser, TUserEntity>(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TDataStore : IdentityDataStore<TDataStore, TUser, TUserEntity>
        where TUser : User, new()
        where TUserEntity : UserEntity, new()
        => IdentityProviderWebApi.Build<TDataStore, TUser, Role>(args, setup, configure).Run();

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run(string[] args, Action<IdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<IdentityDataStore, User, UserEntity>(args, setup, configure).Run();
}