namespace VttTools.WebApp.Pages;

public sealed class ErrorPageHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : ComponentHandler<ErrorPageHandler, ErrorPage>(httpContext, navigationManager, loggerFactory) {
    internal ErrorPageState State { get; } = new();

    public void Configure()
        => State.RequestId = Activity.Current?.Id ?? HttpContext?.TraceIdentifier;
}