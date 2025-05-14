namespace VttTools.WebApp.Components;

public class PageHandler {
    public virtual bool Configure() => true;

    public virtual Task ConfigureAsync() {
        Configure();
        return Task.CompletedTask;
    }
}

public class PageHandler<THandler, TPage>(TPage page)
    : PageHandler
    where THandler : PageHandler<THandler, TPage>
    where TPage : IPage {
    protected TPage Page { get; } = page;
}