namespace VttTools.WebApp.Components.Game.Pages;

public class ErrorHandlerTests {
    [Fact]
    public void Initialize_SetsRequestIdFromHttpContext() {
        // Arrange
        var state = new Error.PageState();
        var httpContext = Substitute.For<HttpContext>();
        httpContext.TraceIdentifier.Returns("test-trace-id");

        // Act
        Error.Handler.Initialize(httpContext, state);

        // Assert
        state.RequestId.Should().Be("test-trace-id");
        state.ShowRequestId.Should().BeTrue();
    }

    [Fact]
    public void Initialize_SetsRequestIdFromActivityCurrent_WhenAvailable() {
        // Arrange
        var state = new Error.PageState();
        var httpContext = Substitute.For<HttpContext>();
        httpContext.TraceIdentifier.Returns("http-trace-id");

        var activity = new Activity("TestActivity");
        activity.Start();
        activity.SetIdFormat(ActivityIdFormat.W3C);

        try {
            // Act
            Error.Handler.Initialize(httpContext, state);

            // Assert
            state.RequestId.Should().Be(activity.Id);
            state.ShowRequestId.Should().BeTrue();
        }
        finally {
            activity.Stop();
        }
    }

    [Fact]
    public void Initialize_ShowRequestId_IsFalse_WhenRequestIdIsNull() {
        // Arrange
        var state = new Error.PageState();

        // Act
        Error.Handler.Initialize(null, state);

        // Assert
        state.RequestId.Should().BeNull();
        state.ShowRequestId.Should().BeFalse();
    }
}