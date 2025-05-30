namespace VttTools.WebApp.Pages;

public class ErrorPageTests
    : ComponentTestContext {
    [Fact]
    public void WhenRequestIdIsEmpty_DoesNotShowRequestId() {
        // Act
        var cut = RenderComponent<ErrorPage>();

        // Assert
        var requestIdElement = cut.FindAll("p").FirstOrDefault(p => p.TextContent.Contains("Request ID"));
        requestIdElement.Should().BeNull();
    }

    [Fact]
    public void WhenRequestIdIsSet_ShowsRequestId() {
        // Act
        HttpContext.TraceIdentifier.Returns("test-trace-id");
        var cut = RenderComponent<ErrorPage>();

        // Assert
        var requestIdElement = cut.FindAll("p").FirstOrDefault(p => p.TextContent.Contains("Request ID"));
        requestIdElement.Should().NotBeNull();
        requestIdElement.TextContent.Should().Contain("test-trace-id");
    }

    [Fact]
    public void WhenHasErrorMessage_ShowsErrorMessage() {
        // Act
        var cut = RenderComponent<ErrorPage>();

        // Assert
        cut.FindAll("h1").Any(h => h.TextContent.Contains("Error")).Should().BeTrue();
        cut.FindAll("h2").Any(h => h.TextContent.Contains("An error occurred")).Should().BeTrue();
    }
}