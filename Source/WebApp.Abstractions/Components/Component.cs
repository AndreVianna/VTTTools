namespace VttTools.WebApp.Components;

public class Component
    : ComponentBase
    , IComponent {
    [CascadingParameter]
    public virtual HttpContext HttpContext { get; set; } = null!;
    [Inject]
    public virtual NavigationManager NavigationManager { get; set; } = null!;
    public virtual string? CurrentLocation { get; protected set; }
    public virtual bool IsReady { get; private set; }

    protected override void OnInitialized() {
        base.OnInitialized();
        CurrentLocation ??= GetUrlRelativeToBase(NavigationManager.Uri);
    }

    public override async Task SetParametersAsync(ParameterView parameters) {
        await base.SetParametersAsync(parameters);
        await ConfigureAsync();
        IsReady = true;
        await StateHasChangedAsync();
    }

    protected virtual void Configure() { }
    protected virtual Task ConfigureAsync() {
        Configure();
        return Task.CompletedTask;
    }

    protected virtual string GetUrlRelativeToBase(string url) => NavigationManager.ToBaseRelativePath(url);
    protected virtual Uri GetAbsoluteUri(string url) => NavigationManager.ToAbsoluteUri(Ensure.IsNotNull(url).Trim());
    public virtual Task StateHasChangedAsync() => InvokeAsync(StateHasChanged);
}