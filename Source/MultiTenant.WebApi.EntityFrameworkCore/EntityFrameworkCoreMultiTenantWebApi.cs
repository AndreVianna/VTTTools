// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

/// <summary>
/// Provides static factory methods for creating and configuring an Tenant Provider Web API application builder (<see cref="MultiTenantWebApiBuilder"/>).
/// Includes setup for ASP.NET Core Tenant, user/role management services, data stores, and authentication.
/// </summary>
public static class EntityFrameworkCoreMultiTenantWebApi {
    /// <summary>
    /// Creates a new instance of <see cref="MultiTenantWebApiBuilder"/> using specified data store and tenant types,
    /// and default options (<see cref="MultiTenantWebApiOptions"/>).
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <typeparam name="TTenantEntity">The type of the tenant DbContext entity.</typeparam>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <param name="setup">An optional action to further configure the builder after initial setup.</param>
    /// <returns>A configured <see cref="MultiTenantWebApiBuilder"/> instance.</returns>
    public static MultiTenantWebApiBuilder CreateBuilder<TTenantDataStore, TTenant, TTenantEntity>(string[] args, Action<MultiTenantWebApiBuilder>? setup = null)
        where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
        where TTenant : Tenant, new()
        where TTenantEntity : TenantEntity, new() {
        var builder = MultiTenantWebApi.CreateBuilder<TTenantDataStore, TTenant>(args, setup);

        builder.Services.AddSingleton<ITenantMapper<TTenant, TTenantEntity>, TenantMapper<TTenant, TTenantEntity>>();

        return builder;
    }

    /// <summary>
    /// Creates a new instance of <see cref="MultiTenantWebApiBuilder"/> using specified data store, user, and role types,
    /// and default options (<see cref="MultiTenantWebApiOptions"/>).
    /// </summary>
    /// <param name="args">Command line arguments passed to the application.</param>
    /// <returns>A configured <see cref="MultiTenantWebApiBuilder"/> instance.</returns>
    public static MultiTenantWebApiBuilder CreateBuilder(string[] args)
        => CreateBuilder<TenantDataStore, Tenant, TenantEntity>(args);

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <typeparam name="TTenantEntity">The type of the tenant DbContext entity.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build<TTenantDataStore, TTenant, TTenantEntity>(string[] args, Action<MultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
        where TTenant : Tenant, new()
        where TTenantEntity : TenantEntity, new()
        => MultiTenantWebApi.Build<TTenantDataStore, TTenant>(args, setup, configure);

    /// <summary>
    /// Creates, configures, and builds the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    /// <returns>The configured <see cref="WebApplication"/>.</returns>
    public static WebApplication Build(string[] args, Action<MultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<TenantDataStore, Tenant, TenantEntity>(args, setup, configure);

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <typeparam name="TTenantDataStore">The type of the tenant data store implementation.</typeparam>
    /// <typeparam name="TTenant">The type of the tenant model.</typeparam>
    /// <typeparam name="TTenantEntity">The type of the tenant DbContext entity.</typeparam>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run<TTenantDataStore, TTenant, TTenantEntity>(string[] args, Action<MultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        where TTenantDataStore : TenantDataStore<TTenantDataStore, TTenant, TTenantEntity>
        where TTenant : Tenant, new()
        where TTenantEntity : TenantEntity, new()
        => MultiTenantWebApi.Build<TenantDataStore, Tenant>(args, setup, configure).Run();

    /// <summary>
    /// Creates, configures, builds, and runs the <see cref="WebApplication"/> using the default builder and options.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <param name="setup">Optional action to configure the builder.</param>
    /// <param name="configure">Optional action to configure the built application pipeline.</param>
    public static void Run(string[] args, Action<MultiTenantWebApiBuilder>? setup = null, Action<WebApplication>? configure = null)
        => Build<TenantDataStore, Tenant, TenantEntity>(args, setup, configure).Run();
}