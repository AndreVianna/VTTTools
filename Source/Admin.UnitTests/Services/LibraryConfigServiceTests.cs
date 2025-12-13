namespace VttTools.Admin.UnitTests.Services;

public sealed class LibraryConfigServiceTests {
    private readonly ILogger<LibraryConfigService> _mockLogger;
    private readonly LibraryConfigService _sut;
    private readonly Guid _masterUserId;

    public LibraryConfigServiceTests() {
        _masterUserId = Guid.CreateVersion7();
        var options = Options.Create(new PublicLibraryOptions { MasterUserId = _masterUserId });
        _mockLogger = Substitute.For<ILogger<LibraryConfigService>>();
        _sut = new LibraryConfigService(options, _mockLogger);
    }

    #region GetConfigAsync Tests

    [Fact]
    public async Task GetConfigAsync_ReturnsConfigWithMasterUserId() {
        var result = await _sut.GetConfigAsync(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.MasterUserId.Should().Be(_masterUserId);
    }

    [Fact]
    public async Task GetConfigAsync_LogsInformation() {
        await _sut.GetConfigAsync(TestContext.Current.CancellationToken);

#pragma warning disable CA1873 // Avoid potentially expensive logging
        _mockLogger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("Retrieving library configuration")),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
#pragma warning restore CA1873 // Avoid potentially expensive logging
    }

    #endregion
}
