namespace VttTools.GameService.Middlewares;

public sealed class LoggedExceptionHandler(ILogger<LoggedExceptionHandler> logger)
    : IExceptionHandler {
    public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken) {
        logger.LogError(exception, "An exception occurred while processing the request.");
        return ValueTask.FromResult(true);
    }
}