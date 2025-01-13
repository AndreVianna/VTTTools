using System.Diagnostics;

using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http.Features;

// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Hosting;

[DebuggerDisplay("{DebuggerToString(),nq}")]
[DebuggerTypeProxy(typeof(WebApiDebugView))]
public sealed class WebApi : IHost, IApplicationBuilder, IEndpointRouteBuilder, IAsyncDisposable {
    private const string _globalEndpointRouteBuilderKey = "__GlobalEndpointRouteBuilder";
    private readonly WebApplication _app;

    internal WebApi(WebApplication app, WebApiType type) {
        _app = app;
        Type = type;
        ApplicationBuilder = new(_app.Services, ServerFeatures);
        Logger = _app.Services.GetRequiredService<ILoggerFactory>().CreateLogger(Environment.ApplicationName);
        Properties[_globalEndpointRouteBuilderKey] = this;
    }

    void IDisposable.Dispose() => ((IDisposable)_app).Dispose();
    public ValueTask DisposeAsync() => _app.DisposeAsync();

    public static WebApi Create(string[]? args = null)
        => CreateBuilder(args).Build();

    public static WebApiBuilder CreateBuilder(string[]? args = null)
        => CreateBuilderInternal(new() { Type = WebApiType.Default, Args = args ?? [] });

    public static WebApiBuilder CreateSlimBuilder(string[]? args = null)
        => CreateBuilderInternal(new() { Type = WebApiType.Slim, Args = args ?? [] });

    public static WebApiBuilder CreateEmptyBuilder(string[]? args = null)
        => CreateBuilderInternal(new() { Type = WebApiType.Empty, Args = args ?? [] });

    public static WebApiBuilder CreateBuilder(WebApiOptions options)
        => CreateBuilderInternal(options);

    private static WebApiBuilder CreateBuilderInternal(WebApiOptions options) {
        var webAppOptions = new WebApplicationOptions {
            Args = options.Args,
            EnvironmentName = options.EnvironmentName,
            ApplicationName = options.ApplicationName,
        };
        var webAppBuilder = options.Type switch {
            WebApiType.Default => WebApplication.CreateBuilder(webAppOptions),
            WebApiType.Slim => WebApplication.CreateSlimBuilder(webAppOptions),
            _ => WebApplication.CreateEmptyBuilder(webAppOptions),
        };
        return new(webAppBuilder, options);
    }

    //public static WebApiBuilder CreateBuilder<TDatabase>(string[] args, Action<DbContextOptionsBuilder, IConfiguration>? configure = null)
    //    where TDatabase : DbContext {
    //    var builder = WebApplication.CreateBuilder(args);
    //    builder.Services.AddProblemDetails();
    //    builder.Services.AddDbContext<TDatabase>(options => configure?.Invoke(options, builder.Configuration));
    //    builder.Services.AddScoped<ITokenService, TokenService<TDatabase>>();
    //    return new(builder);
    //}

    public WebApiType Type { get; }

    public IServiceProvider Services => _app.Services;
    public IConfiguration Configuration => _app.Configuration;
    public IWebHostEnvironment Environment => _app.Environment;
    public IHostApplicationLifetime Lifetime => _app.Lifetime;
    public ILogger Logger { get; }
    public ICollection<string> Urls => ServerFeatures.GetRequiredFeature<IServerAddressesFeature>().Addresses;

    public IServiceProvider ApplicationServices { get => ((IApplicationBuilder)_app).ApplicationServices; set => ((IApplicationBuilder)_app).ApplicationServices = value; }
    IFeatureCollection IApplicationBuilder.ServerFeatures => ServerFeatures;
    internal IFeatureCollection ServerFeatures => ((IApplicationBuilder)_app).ServerFeatures;
    internal IDictionary<string, object?> Properties => ApplicationBuilder.Properties;
    IDictionary<string, object?> IApplicationBuilder.Properties => ((IApplicationBuilder)_app).Properties;
    internal ICollection<EndpointDataSource> DataSources => ((IEndpointRouteBuilder)_app).DataSources;
    ICollection<EndpointDataSource> IEndpointRouteBuilder.DataSources => DataSources;

    internal ApplicationBuilder ApplicationBuilder { get; }

    IServiceProvider IEndpointRouteBuilder.ServiceProvider => Services;

    IApplicationBuilder IApplicationBuilder.New() => ((IApplicationBuilder)_app).New();
    IApplicationBuilder IEndpointRouteBuilder.CreateApplicationBuilder() => ((IEndpointRouteBuilder)_app).CreateApplicationBuilder();

    internal RequestDelegate BuildRequestDelegate() => ApplicationBuilder.Build();
    RequestDelegate IApplicationBuilder.Build() => ((IApplicationBuilder)_app).Build();

    public Task StartAsync(CancellationToken cancellationToken = default) => _app.StartAsync(cancellationToken);
    public Task StopAsync(CancellationToken cancellationToken = default) => _app.StopAsync(cancellationToken);
    public IApplicationBuilder Use(Func<RequestDelegate, RequestDelegate> middleware) => _app.Use(middleware);

    private string DebuggerToString() => $"""ApplicationName = "{Environment.ApplicationName}", IsRunning = {(IsRunning ? "true" : "false")}""";

    // Web app is running if the app has been started and hasn't been stopped.
    private bool IsRunning => Lifetime.ApplicationStarted.IsCancellationRequested && !Lifetime.ApplicationStopped.IsCancellationRequested;

    internal sealed class WebApiDebugView(WebApi api) {
        public IServiceProvider Services => api.Services;
        public IConfiguration Configuration => api.Configuration;
        public IWebHostEnvironment Environment => api.Environment;
        public IHostApplicationLifetime Lifetime => api.Lifetime;
        public ILogger Logger => api.Logger;
        public string Urls => string.Join(", ", api.Urls);
        public IEnumerable<Endpoint> Endpoints
            => api.Services.GetRequiredService<EndpointDataSource>() is CompositeEndpointDataSource compositeEndpointDataSource
            && compositeEndpointDataSource.DataSources.Intersect(api.DataSources).Count() != api.DataSources.Count
                   ? new CompositeEndpointDataSource(api.DataSources).Endpoints
                   : api.Services.GetRequiredService<EndpointDataSource>().Endpoints;
        public bool IsRunning => api.IsRunning;
        public IEnumerable<string> Middleware
            => api.Properties.TryGetValue("__MiddlewareDescriptions", out var value)
            && value is IList<string> descriptions
                   ? descriptions
                   : throw new NotSupportedException("Unable to get configured middleware.");
    }
}