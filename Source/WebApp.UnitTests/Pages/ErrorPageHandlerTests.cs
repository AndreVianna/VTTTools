namespace VttTools.WebApp.Pages;

public class ErrorPageHandlerTests
    : WebAppTestContext {
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();

    public ErrorPageHandlerTests() {
        _httpContext.TraceIdentifier.Returns("test-trace-id");
    }

    [Fact]
    public void WhenDoesNotHaveTraceIdentifier_ShowsDefaultRequestId() {
        // Act
        var handler = CreateHandler();
        _httpContext.TraceIdentifier.Returns((string)null!);

        // Assert
        handler.State.ShowRequestId.Should().BeTrue();
        handler.State.RequestId.Should().Be("test-trace-id");
    }

    [Fact]
    public void WhenHasTraceIdentifier_ShowsTestTraceId() {
        // Act
        var handler = CreateHandler();

        // Assert
        handler.State.ShowRequestId.Should().BeTrue();
        handler.State.RequestId.Should().Be("test-trace-id");
    }

    [Fact]
    public void WhenHasActivity_ShowsActivityId() {
        // Arrange
        using var activity = new Activity("TestActivity");
        activity.Start();
        activity.SetIdFormat(ActivityIdFormat.W3C);

        // Act
        var handler = CreateHandler();

        // Assert
        handler.State.ShowRequestId.Should().BeTrue();
        handler.State.RequestId.Should().Be(activity.Id);
    }

    [Fact]
    public void WhenShowRequestIdIsFalse_WhenRequestIdIsNull() {
        // Act
        var handler = CreateHandler();

        // Assert
        handler.State.ShowRequestId.Should().BeFalse();
        handler.State.RequestId.Should().BeNull();
    }

    private ErrorPageHandler CreateHandler(bool isConfigured = true) {
        var handler = new ErrorPageHandler(HttpContext, NavigationManager, NullLoggerFactory.Instance);
        if (isConfigured) handler.Configure();
        return handler;
    }
}