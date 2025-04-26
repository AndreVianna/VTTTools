namespace VttTools.WebApp.Components.Game.Pages;

public class ErrorHandlerTests {
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();

    public ErrorHandlerTests() {
        _httpContext.TraceIdentifier.Returns("test-trace-id");
    }

    [Fact]
    public void Initialize_SetsRequestIdFromHttpContext() {
        // Act
        var handler = Error.Handler.Initialize(_httpContext);

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
        var handler = Error.Handler.Initialize(_httpContext);

        // Assert
        handler.State.ShowRequestId.Should().BeTrue();
        handler.State.RequestId.Should().Be(activity.Id);
    }

    [Fact]
    public void Initialize_ShowRequestId_IsFalse_WhenRequestIdIsNull() {
        // Act
        var handler = Error.Handler.Initialize(null);

        // Assert
        handler.State.ShowRequestId.Should().BeFalse();
        handler.State.RequestId.Should().BeNull();
    }
}