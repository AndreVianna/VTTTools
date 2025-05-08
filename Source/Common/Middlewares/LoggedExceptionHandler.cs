namespace VttTools.Middlewares;

public sealed class LoggedExceptionHandler(IHostEnvironment environment, ILogger<LoggedExceptionHandler> logger)
    : IExceptionHandler {
    public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken) {
        logger.LogError(exception, "An exception occurred while processing the request.");
        return ValueTask.FromResult(environment.IsProduction());
    }
}