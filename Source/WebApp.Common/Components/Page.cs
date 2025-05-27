namespace VttTools.WebApp.Components;

public class Page
    : Component, IPage;

public class Page<TPage, THandler>
    : Page
    where TPage : Page<TPage, THandler>
    where THandler : PageHandler<THandler, TPage> {
    public Page() {
        EnsureHandlerIsCreated();
    }

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.ConfigureAsync();
    }

    [MemberNotNull(nameof(Handler))]
    protected void EnsureHandlerIsCreated() {
        if (Handler is not null)
            return;
        Handler = InstanceFactory.Create<THandler>(this);
    }

    protected THandler Handler { get; set; } = null!;
}