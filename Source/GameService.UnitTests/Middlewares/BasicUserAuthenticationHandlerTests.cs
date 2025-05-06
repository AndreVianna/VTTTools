using static VttTools.GameService.Middlewares.BasicUserAuthenticationOptions;

namespace VttTools.GameService.Middlewares;

public class BasicUserAuthenticationHandlerTests {
    private readonly TestHandler _handler;
    private readonly HttpContext _httpContext;

    private sealed class TestHandler(IOptionsMonitor<BasicUserAuthenticationOptions> options)
        : BasicUserAuthenticationHandler(options, NullLoggerFactory.Instance) {
        public Task<AuthenticateResult> CallHandleAuthenticateAsync()
            => HandleAuthenticateAsync();
    }

    public BasicUserAuthenticationHandlerTests() {
        var options = new BasicUserAuthenticationOptions();
        var optionsMonitor = Substitute.For<IOptionsMonitor<BasicUserAuthenticationOptions>>();
        optionsMonitor.CurrentValue.Returns(options);
        _handler = new(optionsMonitor);
        _httpContext = new DefaultHttpContext();
    }

    [Fact]
    public async Task HandleAuthenticateAsync_WithValidHeader_SetsUserIdentity() {
        // Arrange
        const string userId = "user123";
        _httpContext.Request.Headers.Authorization = $"{DefaultScheme} {userId}";
        await _handler.InitializeAsync(new(DefaultScheme, "User Authentication", typeof(BasicUserAuthenticationHandler)), _httpContext);

        // Act
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Ticket.Should().NotBeNull();
        _httpContext.User.Should().NotBeNull();
        _httpContext.User.Identity.Should().NotBeNull();
        _httpContext.User.Identity!.IsAuthenticated.Should().BeTrue();
        _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier).Should().Be(userId);
    }

    [Fact]
    public async Task HandleAuthenticateAsync_WithInvalidHeader_SetsUserIdentity() {
        await _handler.InitializeAsync(new(DefaultScheme, "User Authentication", typeof(BasicUserAuthenticationHandler)), _httpContext);

        // Act
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeFalse();
    }
}