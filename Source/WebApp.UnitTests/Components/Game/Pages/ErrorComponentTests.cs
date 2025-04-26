//namespace VttTools.WebApp.Components.Game.Pages;

//public class ErrorComponentTests : Bunit.TestContext {
//    [Fact]
//    public void Error_DoesNotShowRequestId_WhenRequestIdIsEmpty() {
//        // Act
//        var cut = RenderComponent<Error>();

//        // Mocking HttpContext is not easy in bUnit, so will directly modify the state
//        cut.Instance.State.RequestId = null;
//        cut.SetParametersAndRender();

//        // Assert
//        var requestIdElement = cut.FindAll("p").FirstOrDefault(p => p.TextContent.Contains("Request ID"));
//        requestIdElement.Should().BeNull();
//    }

//    [Fact]
//    public void Error_ShowsRequestId_WhenRequestIdIsSet() {
//        // Act
//        var cut = RenderComponent<Error>();

//        // Mocking HttpContext is not easy in bUnit, so will directly modify the state
//        cut.Instance.State.RequestId = "test-request-id";
//        cut.SetParametersAndRender();

//        // Assert
//        var requestIdElement = cut.FindAll("p").FirstOrDefault(p => p.TextContent.Contains("Request ID"));
//        requestIdElement.Should().NotBeNull();
//        requestIdElement.TextContent.Should().Contain("test-request-id");
//    }

//    [Fact]
//    public void Error_ShowsErrorMessage() {
//        // Act
//        var cut = RenderComponent<Error>();

//        // Assert
//        cut.FindAll("h1").Any(h => h.TextContent.Contains("Error")).Should().BeTrue();
//        cut.FindAll("h2").Any(h => h.TextContent.Contains("An error occurred")).Should().BeTrue();
//    }
//}
