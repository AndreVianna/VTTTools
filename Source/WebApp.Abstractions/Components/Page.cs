namespace VttTools.WebApp.Components;

public class Page
    : Component, IPage {
    [Inject]
    private ILoggerFactory LoggerFactory { get; set; } = null!;
    [Inject]
    public virtual IServiceScopeFactory ScopeFactory { get; set; } = null!;

    public virtual ILogger Logger { get; }

    public Page() {
        Logger = LoggerFactory.CreateLogger(GetType());
    }
}