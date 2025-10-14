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

    [Theory]
    [InlineData("019639ea-c7de-7a01-8548-41edfccde206", "6jmWAd7HAXqFSEHt_M3iBg")]
    [InlineData("0199bf66-76d7-7e4a-9398-8022839c7d80", "Zr-ZAdd2Sn6TmIAig5x9gA")]
    public async Task HandleAuthenticateAsync_WithKnownFrontendHeaders_DecodesCorrectly(
        string expectedGuidString,
        string xUserHeader) {
        // Arrange - Use x-user header value from frontend encoding
        _httpContext.Request.Headers[UserHeader] = xUserHeader;
        await _handler.InitializeAsync(new(Scheme, "User Authentication", typeof(UserIdentificationHandler)), _httpContext);

        // Act
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();

        // Verify decoded GUID matches expected
        var claim = _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var decodedGuid = Guid.Parse(claim!);
        var expectedGuid = new Guid(expectedGuidString);

        decodedGuid.Should().Be(expectedGuid,
            $"Backend should decode x-user header '{xUserHeader}' to GUID '{expectedGuidString}'");
    }

    [Fact]
    public async Task RoundTrip_FrontendEncoding_BackendDecoding_MatchesOriginalGuid() {
        // This test verifies complete round-trip compatibility:
        // Frontend encodes GUID → x-user header → Backend decodes → Same GUID

        // Arrange - Simulate frontend encoding
        var originalGuid = new Guid("019639ea-c7de-7a01-8548-41edfccde206");
        var bytes = originalGuid.ToByteArray();
        var frontendEncodedHeader = Base64UrlTextEncoder.Encode(bytes);

        _httpContext.Request.Headers[UserHeader] = frontendEncodedHeader;
        await _handler.InitializeAsync(new(Scheme, "User Authentication", typeof(UserIdentificationHandler)), _httpContext);

        // Act - Backend decodes
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert - Decoded GUID matches original
        result.Succeeded.Should().BeTrue();
        var claim = _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var decodedGuid = Guid.Parse(claim!);

        decodedGuid.Should().Be(originalGuid,
            "Round-trip: frontend encoding → backend decoding should preserve GUID");
    }

    [Fact]
    public async Task HandleAuthenticateAsync_StoresClaimInFormatN() {
        // Verify claim is stored in format "n" (no hyphens, lowercase)
        var userId = new Guid("019639EA-C7DE-7A01-8548-41EDFCCDE206");
        _httpContext.Request.Headers[UserHeader] = Base64UrlTextEncoder.Encode(userId.ToByteArray());
        await _handler.InitializeAsync(new(Scheme, "User Authentication", typeof(UserIdentificationHandler)), _httpContext);

        // Act
        var result = await _handler.CallHandleAuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();
        var claim = _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Format "n": 32 hex digits, no hyphens, lowercase
        claim.Should().MatchRegex("^[0-9a-f]{32}$", "Claim should be in format 'n'");
        claim.Should().Be("019639eac7de7a01854841edfccde206", "Expected format: no hyphens, lowercase");
    }
}