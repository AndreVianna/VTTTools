namespace VttTools.WebApp.Components;

public class Page
    : Component, IPage {
    [Inject]
    private ILoggerFactory LoggerFactory { get; set; } = null!;
    [Inject]
    public IServiceScopeFactory ScopeFactory { get; set; } = null!;

    public ILogger Logger { get; private set; } = null!;

    protected override void OnInitialized() {
        base.OnInitialized();
        Logger = LoggerFactory.CreateLogger(GetType());
    }
}