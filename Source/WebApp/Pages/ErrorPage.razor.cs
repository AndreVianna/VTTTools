namespace VttTools.WebApp.Pages;

public partial class ErrorPage {
    private Handler _handler = null!;

    [CascadingParameter]
    internal HttpContext? HttpContext { get; set; }

    internal PageState State => _handler?.State ?? new();

    protected override void OnInitialized()
        => _handler = Handler.Initialize(HttpContext);
}