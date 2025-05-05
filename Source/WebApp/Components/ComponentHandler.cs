namespace VttTools.WebApp.Components;

public class ComponentHandler<THandler, TComponent>(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : IDisposable, IAsyncDisposable
    where THandler : ComponentHandler<THandler, TComponent>
    where TComponent : ExtendedComponent<TComponent, THandler> {
    private bool _isDisposed;

    protected ILogger<TComponent> Logger => loggerFactory.CreateLogger<TComponent>();
    protected NavigationManager NavigationManager => navigationManager;
    protected HttpContext HttpContext => httpContext;

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

public class AuthorizedComponentHandler<THandler, TComponent>(HttpContext httpContext, NavigationManager navigationManager, CurrentUser currentUser, ILoggerFactory loggerFactory)
    : ComponentHandler<THandler, TComponent>(httpContext, navigationManager, loggerFactory)
    where THandler : ComponentHandler<THandler, TComponent>
    where TComponent : ExtendedComponent<TComponent, THandler> {
    protected CurrentUser CurrentUser => currentUser;
}
