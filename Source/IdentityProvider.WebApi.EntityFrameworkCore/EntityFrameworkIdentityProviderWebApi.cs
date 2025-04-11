// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

/// <summary>
/// Provides static factory methods for creating and configuring an Identity Provider Web API application builder (<see cref="EntityFrameworkIdentityProviderWebApiBuilder"/>).
/// Includes setup for ASP.NET Core Identity, user/role management services, data stores, and authentication.
/// </summary>
public static class EntityFrameworkIdentityProviderWebApi {
    /// <summary>
    /// Creates a new instance of <see cref="EntityFrameworkIdentityProviderWebApiBuilder"/> using specified data store, user, and role types,
    /// and default options (<see cref="IdentityProviderWebApiOptions"/>).
    /// </summary>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <returns>A configured <see cref="EntityFrameworkIdentityProviderWebApiBuilder"/> instance.</returns>
    public static EntityFrameworkIdentityProviderWebApiBuilder CreateBuilder(string[] args)
        => CreateBuilder<EntityFrameworkIdentityProviderWebApiBuilder, EntityFrameworkIdentityProviderWebApiOptions, UserDataStore, User, UserEntity>(args);

    /// <summary>
    /// Creates a new instance of <see cref="TBuilder"/> using specified data store and user types,
    /// and default options (<see cref="EntityFrameworkIdentityProviderWebApiOptions"/>).
    /// </summary>
    /// <typeparam name="TBuilder">The type of the builder, inheriting from <see cref="EntityFrameworkIdentityProviderWebApiBuilder{TBuilder, TOptions, TUserDataStore, TUser, TUserEntity}"/>.</typeparam>
    /// <typeparam name="TOptions">The type of the options record.</typeparam>
    /// <typeparam name="TUserDataStore">The type of the identity data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model</typeparam>
    /// <typeparam name="TUserEntity">The type of the user entity</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <see cref="TBuilder"/> instance.</returns>
    public static TBuilder CreateBuilder<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>(string[] args, Action<TBuilder>? setup = null)
        where TBuilder : EntityFrameworkIdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>
        where TOptions : EntityFrameworkIdentityProviderWebApiOptions<TOptions>, new()
        where TUserDataStore : UserDataStore<TUserDataStore, TUser, TUserEntity>
        where TUser : User, new()
        where TUserEntity : UserEntity, new() {
        var builder = InstanceFactory.Create<TBuilder>((object)args);
        setup?.Invoke(builder);
        return builder;
    }

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build(string[] args, Action<EntityFrameworkIdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<EntityFrameworkIdentityProviderWebApiBuilder, EntityFrameworkIdentityProviderWebApiOptions, UserDataStore, User, UserEntity>(args, setup, configure);

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TBuilder">Specifies the type of builder used to create the web application.</typeparam>
    /// <typeparam name="TOptions">Defines the options that configure the behavior of the identity provider web application.</typeparam>
    /// <typeparam name="TUserDataStore">The type of the user data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model</typeparam>
    /// <typeparam name="TUserEntity">The type of the user entity</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : EntityFrameworkIdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>
        where TOptions : EntityFrameworkIdentityProviderWebApiOptions<TOptions>, new()
        where TUserDataStore : UserDataStore<TUserDataStore, TUser, TUserEntity>
        where TUser : User, new()
        where TUserEntity : UserEntity, new()
        => IdentityProviderWebApi.Build<TBuilder, TOptions, TUserDataStore, TUser>(args, setup, configure);

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run(string[] args, Action<EntityFrameworkIdentityProviderWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<EntityFrameworkIdentityProviderWebApiBuilder, EntityFrameworkIdentityProviderWebApiOptions, UserDataStore, User, UserEntity>(args, setup, configure).Run();

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TBuilder">Specifies the type of builder used to create the web application.</typeparam>
    /// <typeparam name="TOptions">Defines the options that configure the behavior of the identity provider web application.</typeparam>
    /// <typeparam name="TUserDataStore">The type of the user data store implementation.</typeparam>
    /// <typeparam name="TUser">The type of the user model</typeparam>
    /// <typeparam name="TUserEntity">The type of the user entity</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : EntityFrameworkIdentityProviderWebApiBuilder<TBuilder, TOptions, TUserDataStore, TUser, TUserEntity>
        where TOptions : EntityFrameworkIdentityProviderWebApiOptions<TOptions>, new()
        where TUserDataStore : UserDataStore<TUserDataStore, TUser, TUserEntity>
        where TUser : User, new()
        where TUserEntity : UserEntity, new()
        => IdentityProviderWebApi.Build<TBuilder, TOptions, TUserDataStore, TUser>(args, setup, configure).Run();
}