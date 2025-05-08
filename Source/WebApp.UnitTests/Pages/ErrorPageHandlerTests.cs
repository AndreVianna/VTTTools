namespace VttTools.WebApp.Pages;

public class ErrorPageHandlerTests
    : WebAppTestContext {
    public ErrorPageHandlerTests() {
        HttpContext.TraceIdentifier.Returns("test-trace-id");
    }

    [Fact]
    public void WhenDoesNotHaveTraceIdentifier_DoesNotShowRequestId() {
        // Arrange
        HttpContext.TraceIdentifier.Returns((string)null!);

        // Act
        var handler = CreateHandler();

        // Assert
        handler.State.ShowRequestId.Should().BeFalse();
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

    private ErrorPageHandler CreateHandler(bool isConfigured = true) {
        var page = Substitute.For<IPublicPage>();
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new ErrorPageHandler(page);
        if (isConfigured)
            handler.Configure();
        return handler;
    }
}