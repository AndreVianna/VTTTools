namespace VttTools.WebApp.Components.Game.Pages;

public partial class Error {
    private Handler _handler = null!;

    [CascadingParameter]
    internal HttpContext? HttpContext { get; set; }

    internal bool IsLoading { get; set; } = true;
    internal PageState State => _handler.State;

    protected override void OnInitialized() {
        base.OnInitialized();
        _handler = Handler.Initialize(HttpContext);
        IsLoading = false;
    }
}