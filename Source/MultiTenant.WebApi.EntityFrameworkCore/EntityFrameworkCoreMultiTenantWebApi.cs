// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

/// <summary>
/// Provides static factory methods for creating and configuring a Tenant Provider Web API application.
/// Includes setup for ASP.NET Core Tenant, user/role management services, data stores, and authentication.
/// </summary>
public static class EntityFrameworkCoreMultiTenantWebApi {
    /// <summary>
    /// Creates a new instance of <see cref="EntityFrameworkMultiTenantWebApiBuilder"/> using the default options, data store, and tenant types.
    /// </summary>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <returns>A configured <see cref="EntityFrameworkMultiTenantWebApiBuilder"/> instance.</returns>
    public static EntityFrameworkMultiTenantWebApiBuilder CreateBuilder(string[] args, Action<EntityFrameworkMultiTenantWebApiBuilder>? setup = null)
        => CreateBuilder<EntityFrameworkMultiTenantWebApiBuilder, EntityFrameworkMultiTenantWebApiOptions, TenantDataStore, Tenant, TenantEntity>(args, setup);

    /// <summary>
    /// Creates a new instance of <see cref="TBuilder"/> using specified options, data store, and tenant types.
    /// </summary>
    /// <typeparam name="TBuilder">The type of the builder, inheriting from <see cref="EntityFrameworkMultiTenantWebApiBuilder{TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity}"/>.</typeparam>
    /// <typeparam name="TOptions">The type of the options record.</typeparam>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <typeparam name="TTenantEntity">The type of the tenant DbContext entity.</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <see cref="TBuilder"/> instance.</returns>
    public static TBuilder CreateBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>(string[] args, Action<TBuilder>? setup = null)
        where TBuilder : EntityFrameworkMultiTenantWebApiBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>
        where TOptions : EntityFrameworkMultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
        where TTenant : Tenant, new()
        where TTenantEntity : TenantEntity, new() {
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
    public static WebApplication Build(string[] args, Action<EntityFrameworkMultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<EntityFrameworkMultiTenantWebApiBuilder, EntityFrameworkMultiTenantWebApiOptions, TenantDataStore, Tenant, TenantEntity>(args, setup, configure);

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TBuilder">Specifies the type of builder used to create the web application.</typeparam>
    /// <typeparam name="TOptions">Defines the options that configure the behavior of the multi-tenant web application.</typeparam>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <typeparam name="TTenantEntity">The type of the tenant DbContext entity.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : EntityFrameworkMultiTenantWebApiBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>
        where TOptions : EntityFrameworkMultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
        where TTenant : Tenant, new()
        where TTenantEntity : TenantEntity, new() {
        var builder = CreateBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>(args, setup);
        return builder.Build(configure);
    }

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run(string[] args, Action<EntityFrameworkMultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<EntityFrameworkMultiTenantWebApiBuilder, EntityFrameworkMultiTenantWebApiOptions, TenantDataStore, Tenant, TenantEntity>(args, setup, configure).Run();

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TBuilder">Defines the type responsible for building the multi-tenant web API.</typeparam>
    /// <typeparam name="TOptions">Specifies the options that configure the multi-tenant behavior of the web API.</typeparam>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <typeparam name="TTenantEntity">The type of the tenant DbContext entity.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>(string[] args, Action<TBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TBuilder : EntityFrameworkMultiTenantWebApiBuilder<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>
        where TOptions : EntityFrameworkMultiTenantWebApiOptions<TOptions>, new()
        where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
        where TTenant : Tenant, new()
        where TTenantEntity : TenantEntity, new()
        => Build<TBuilder, TOptions, TTenantDataStore, TTenant, TTenantEntity>(args, setup, configure).Run();
}