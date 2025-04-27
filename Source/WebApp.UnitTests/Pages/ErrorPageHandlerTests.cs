namespace VttTools.WebApp.Pages;

public class ErrorPageHandlerTests {
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();

    public ErrorPageHandlerTests() {
        _httpContext.TraceIdentifier.Returns("test-trace-id");
    }

    [Fact]
    public void Initialize_SetsRequestIdFromHttpContext() {
        // Act
        var handler = ErrorPage.Handler.Initialize(_httpContext);

        // Assert
        handler.State.ShowRequestId.Should().BeTrue();
        handler.State.RequestId.Should().Be("test-trace-id");
    }

    [Fact]
    public void Initialize_SetsRequestIdFromActivityCurrent_WhenAvailable() {
        // Arrange
        using var activity = new Activity("TestActivity");
        activity.Start();
        activity.SetIdFormat(ActivityIdFormat.W3C);

        // Act
        var handler = ErrorPage.Handler.Initialize(_httpContext);

        // Assert
        handler.State.ShowRequestId.Should().BeTrue();
        handler.State.RequestId.Should().Be(activity.Id);
    }

    [Fact]
    public void Initialize_ShowRequestId_IsFalse_WhenRequestIdIsNull() {
        // Act
        var handler = ErrorPage.Handler.Initialize(null);

        // Assert
        handler.State.ShowRequestId.Should().BeFalse();
        handler.State.RequestId.Should().BeNull();
    }
}