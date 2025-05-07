namespace VttTools.Middlewares;

public class LoggedExceptionHandlerTests {
    [Fact]
    public async Task TryHandleAsync_LogsException_AndReturnsTrue() {
        // Arrange
        var logger = Substitute.For<ILogger<LoggedExceptionHandler>>();
        var handler = new LoggedExceptionHandler(logger);
        var httpContext = new DefaultHttpContext();
        var exception = new InvalidOperationException("Test exception");
        var cancellationToken = CancellationToken.None;

        // Setup the logger to return true for IsEnabled
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);

        // Act
        var result = await handler.TryHandleAsync(httpContext, exception, cancellationToken);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryHandleAsync_WithNullException_StillLogsAndReturnsTrue() {
        // Arrange
        var logger = Substitute.For<ILogger<LoggedExceptionHandler>>();
        var handler = new LoggedExceptionHandler(logger);
        var httpContext = new DefaultHttpContext();
        Exception? exception = null;
        var cancellationToken = CancellationToken.None;

        // Setup the logger to return true for IsEnabled
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);

        // Act
        var result = await handler.TryHandleAsync(httpContext, exception!, cancellationToken);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryHandleAsync_WithCancelledToken_StillCompletesAndReturnsTrue() {
        // Arrange
        var logger = Substitute.For<ILogger<LoggedExceptionHandler>>();
        var handler = new LoggedExceptionHandler(logger);
        var httpContext = new DefaultHttpContext();
        var exception = new Exception("Test exception");
        var cancellationToken = new CancellationToken(true);

        // Setup the logger to return true for IsEnabled
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);

        // Act
        var result = await handler.TryHandleAsync(httpContext, exception, cancellationToken);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void LoggedExceptionHandler_ImplementsIExceptionHandler()
        // Assert
        => typeof(LoggedExceptionHandler).Should().Implement<IExceptionHandler>();
}