namespace VttTools.WebApp.Pages;

public partial class ErrorPage {
    private ErrorPageHandler _handler = null!;

    internal ErrorPageState State => _handler?.State ?? new();

    protected override void OnInitialized()
        => _handler = ErrorPageHandler.Initialize(HttpContext);
}