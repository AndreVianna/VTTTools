namespace VttTools.WebApp.Components;

public class PageHandler {
    public virtual bool Configure() => true;

    public virtual Task<bool> ConfigureAsync()
        => Task.FromResult(Configure());
}

public class PageHandler<THandler>(IPage page)
    : PageHandler
    where THandler : PageHandler<THandler> {
    protected IPage Page => page;
}