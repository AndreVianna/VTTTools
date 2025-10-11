using static VttTools.Middlewares.UserIdentificationOptions;

namespace VttTools.Middlewares;

public class UserIdentificationHandlerTests {
    private readonly TestHandler _handler;
    private readonly HttpContext _httpContext;

    private sealed class TestHandler(IOptionsMonitor<UserIdentificationOptions> options)
        : UserIdentificationHandler(options, NullLoggerFactory.Instance) {
        public Task<AuthenticateResult> CallHandleAuthenticateAsync()
            => HandleAuthenticateAsync();
    }

    public UserIdentificationHandlerTests() {
        var options = new UserIdentificationOptions();
        var optionsMonitor = Substitute.For<IOptionsMonitor<UserIdentificationOptions>>();
        optionsMonitor.CurrentValue.Returns(options);
        optionsMonitor.Get(Scheme).Returns(options);
        _handler = new(optionsMonitor);
        _httpContext = new DefaultHttpContext();
    }

    [Fact]
    public async Task HandleAuthenticateAsync_WithValidHeader_SetsUserIdentity() {
        // Arrange
        var userId = Guid.CreateVersion7();
        _httpContext.Request.Headers[UserHeader] = Base64UrlTextEncoder.Encode(userId.ToByteArray());
        await _handler.InitializeAsync(new(Scheme, "User Authentication", typeof(UserIdentificationHandler)), _httpContext);

        // Act
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Ticket.Should().NotBeNull();
        _httpContext.User.Should().NotBeNull();
        _httpContext.User.Identity.Should().NotBeNull();
        _httpContext.User.Identity!.IsAuthenticated.Should().BeTrue();
        _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier).Should().Be(userId.ToString("n"));
    }

    [Fact]
    public async Task HandleAuthenticateAsync_WithInvalidHeader_ReturnsFail() {
        await _handler.InitializeAsync(new(Scheme, "User Authentication", typeof(UserIdentificationHandler)), _httpContext);

        // Act
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeFalse();
    }
}