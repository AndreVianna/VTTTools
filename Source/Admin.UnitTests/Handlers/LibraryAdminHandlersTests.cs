namespace VttTools.Admin.Handlers;

public sealed class LibraryAdminHandlersTests {
    private readonly ILibraryConfigService _mockService = Substitute.For<ILibraryConfigService>();

    #region GetConfigHandler Tests

    [Fact]
    public async Task GetConfigHandler_ReturnsOk() {
        var response = new LibraryConfigResponse { MasterUserId = Guid.CreateVersion7() };

        _mockService.GetConfigAsync(Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await LibraryAdminHandlers.GetConfigHandler(
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryConfigResponse>>();
        var okResult = (Ok<LibraryConfigResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task GetConfigHandler_WhenExceptionThrown_ReturnsProblem() {
        _mockService.GetConfigAsync(Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await LibraryAdminHandlers.GetConfigHandler(
            _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}