namespace VttTools.WebApp.Pages;

public sealed class ErrorPageHandler {
    internal ErrorPageState State { get; } = new();

    public static ErrorPageHandler Initialize(HttpContext? httpContext)
        => new() {
            State = {
                RequestId = Activity.Current?.Id ?? httpContext?.TraceIdentifier
            },
        };
}