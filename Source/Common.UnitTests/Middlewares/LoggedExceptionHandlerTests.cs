namespace VttTools.Middlewares;

public class LoggedExceptionHandlerTests {
    [Fact]
    public async Task TryHandleAsync_WhenNotProduction_LogsException_AndReturnsTrue() {
        // Arrange
        var logger = Substitute.For<ILogger<LoggedExceptionHandler>>();
        var environment = Substitute.For<IHostEnvironment>();
        environment.IsProduction().Returns(false);
        var handler = new LoggedExceptionHandler(environment, logger);
        var httpContext = new DefaultHttpContext();
        var exception = new InvalidOperationException("Test exception");
        var cancellationToken = CancellationToken.None;

        // Setup the logger to return true for IsEnabled
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);

        // Act
        var result = await handler.TryHandleAsync(httpContext, exception, cancellationToken);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TryHandleAsync_WhenProduction_LogsException_AndReturnsTrue() {
        // Arrange
        var logger = Substitute.For<ILogger<LoggedExceptionHandler>>();
        var environment = Substitute.For<IHostEnvironment>();
        environment.IsProduction().Returns(true);
        var handler = new LoggedExceptionHandler(environment, logger);
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
        var environment = Substitute.For<IHostEnvironment>();
        var handler = new LoggedExceptionHandler(environment, logger);
        var httpContext = new DefaultHttpContext();
        Exception? exception = null;
        var cancellationToken = CancellationToken.None;

        // Setup the logger to return true for IsEnabled
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);

        // Act
        var result = await handler.TryHandleAsync(httpContext, exception!, cancellationToken);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task TryHandleAsync_WithCancelledToken_StillCompletesAndReturnsTrue() {
        // Arrange
        var logger = Substitute.For<ILogger<LoggedExceptionHandler>>();
        var environment = Substitute.For<IHostEnvironment>();
        var handler = new LoggedExceptionHandler(environment, logger);
        var httpContext = new DefaultHttpContext();
        var exception = new Exception("Test exception");
        var cancellationToken = new CancellationToken(true);

        // Setup the logger to return true for IsEnabled
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);

        // Act
        var result = await handler.TryHandleAsync(httpContext, exception, cancellationToken);

        // Assert
        result.Should().BeFalse();
    }
}