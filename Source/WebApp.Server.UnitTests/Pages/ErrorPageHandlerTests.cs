using VttTools.WebApp.Server.Pages;

namespace VttTools.WebApp.Pages;

public class ErrorPageHandlerTests
    : ComponentTestContext {
    private readonly ErrorPage _page = Substitute.For<ErrorPage>();

    public ErrorPageHandlerTests() {
        HttpContext.TraceIdentifier.Returns("test-trace-id");
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public void WhenDoesNotHaveTraceIdentifier_DoesNotShowRequestId() {
        // Arrange
        HttpContext.TraceIdentifier.Returns((string)null!);

        // Act
        var handler = CreateHandler();

        // Assert
        _page.State.ShowRequestId.Should().BeFalse();
    }

    [Fact]
    public void WhenHasTraceIdentifier_ShowsTestTraceId() {
        // Act
        var handler = CreateHandler();

        // Assert
        _page.State.ShowRequestId.Should().BeTrue();
        _page.State.RequestId.Should().Be("test-trace-id");
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
        _page.State.ShowRequestId.Should().BeTrue();
        _page.State.RequestId.Should().Be(activity.Id);
    }

    private ErrorPageHandler CreateHandler(bool isConfigured = true) {
        var handler = new ErrorPageHandler(_page);
        if (isConfigured) handler.Configure();
        return handler;
    }
}