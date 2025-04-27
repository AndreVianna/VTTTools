namespace VttTools.WebApp.Pages;

public partial class ErrorPage {
    private ErrorPageHandler _handler = null!;

    [CascadingParameter]
    internal HttpContext? HttpContext { get; set; }

    internal ErrorPageState State => _handler?.State ?? new();

    protected override void OnInitialized()
        => _handler = ErrorPageHandler.Initialize(HttpContext);
}