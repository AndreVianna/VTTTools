namespace VttTools.WebApp.Components;

public class PublicComponentHandler<THandler>(HttpContext httpContext, NavigationManager navigationManager, User? user, ILoggerFactory? loggerFactory = null)
    : IDisposable, IAsyncDisposable
    where THandler : PublicComponentHandler<THandler> {
    private bool _isDisposed;

    public PublicComponentHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory? loggerFactory = null)
        : this(httpContext, navigationManager, null, loggerFactory) {
    }

    protected ILogger Logger => loggerFactory?.CreateLogger(GetType().Name) ?? NullLogger.Instance;
    protected NavigationManager NavigationManager => navigationManager;
    protected HttpContext HttpContext => httpContext;
    protected virtual User? CurrentUser => user;

    protected virtual void Dispose(bool disposing) {
    }

    public void Dispose() {
        if (_isDisposed)
            return;
        Dispose(true);
        _isDisposed = true;
        GC.SuppressFinalize(this);
    }

    protected virtual ValueTask DisposeAsyncCore()
        => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
}