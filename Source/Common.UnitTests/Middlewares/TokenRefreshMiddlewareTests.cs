namespace VttTools.Middlewares;

public class TokenRefreshMiddlewareTests {
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUserStorage _userStorage;
    private readonly ILogger<TokenRefreshMiddleware> _logger;
    private readonly TokenRefreshMiddleware _middleware;
    private readonly RequestDelegate _next;
    private readonly DefaultHttpContext _httpContext;

    public TokenRefreshMiddlewareTests() {
        _jwtTokenService = Substitute.For<IJwtTokenService>();
        _userStorage = Substitute.For<IUserStorage>();
        _logger = Substitute.For<ILogger<TokenRefreshMiddleware>>();
        _next = Substitute.For<RequestDelegate>();
        _middleware = new(_next, _logger);
        _httpContext = new();
    }

    [Fact]
    public async Task InvokeAsync_WithSuccessfulRequest_RefreshesToken() {
        var userId = Guid.NewGuid();
        var user = new User {
            Id = userId,
            Email = "test@example.com",
            Name = "Test User",
            Roles = ["User"],
        };
        const string newToken = "new.jwt.token";

        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, userId.ToString()),
                                                   ], "test"));

        _userStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _jwtTokenService.GenerateToken(user, user.Roles, false).Returns(newToken);

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().ContainKey("X-Refreshed-Token");
        _httpContext.Response.Headers["X-Refreshed-Token"].ToString().Should().Be(newToken);
    }

    [Fact]
    public async Task InvokeAsync_With204Response_RefreshesToken() {
        var userId = Guid.NewGuid();
        var user = new User {
            Id = userId,
            Email = "test@example.com",
            Name = "Test User",
            Roles = [],
        };
        const string newToken = "new.jwt.token";

        _httpContext.Response.StatusCode = 204;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, userId.ToString()),
                                                   ], "test"));

        _userStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _jwtTokenService.GenerateToken(user, user.Roles, false).Returns(newToken);

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().ContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithFailureStatusCode_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 400;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                                                   ], "test"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_With404StatusCode_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 404;
        _httpContext.Request.Path = "/api/test";

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_With500StatusCode_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 500;
        _httpContext.Request.Path = "/api/test";

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithAuditPath_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/admin/audit/logs";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                                                   ], "test"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithAuditPathCaseInsensitive_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/API/ADMIN/AUDIT/summary";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                                                   ], "test"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithUnauthenticatedUser_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity());

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithNullIdentity_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new();

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithMissingUserIdClaim_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.Email, "test@example.com"),
                                                   ], "test"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithEmptyUserIdClaim_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, string.Empty),
                                                   ], "test"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithInvalidGuidFormat_DoesNotRefreshToken() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, "not-a-guid"),
                                                   ], "test"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WithNonExistentUser_DoesNotRefreshToken() {
        var userId = Guid.NewGuid();
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, userId.ToString()),
                                                   ], "test"));

        _userStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WhenUserStorageThrows_DoesNotRefreshToken() {
        var userId = Guid.NewGuid();
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, userId.ToString()),
                                                   ], "test"));

        _userStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns<User?>(_ => throw new("Database error"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_WhenTokenGenerationThrows_DoesNotRefreshToken() {
        var userId = Guid.NewGuid();
        var user = new User {
            Id = userId,
            Email = "test@example.com",
            Name = "Test User",
            Roles = ["User"],
        };
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";
        _httpContext.User = new(new ClaimsIdentity([
                                                       new(ClaimTypes.NameIdentifier, userId.ToString()),
                                                   ], "test"));

        _userStorage.FindByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _jwtTokenService.GenerateToken(user, user.Roles, false).Returns<string>(_ => throw new("Token error"));

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        _httpContext.Response.Headers.Should().NotContainKey("X-Refreshed-Token");
    }

    [Fact]
    public async Task InvokeAsync_CallsNextDelegate() {
        _httpContext.Response.StatusCode = 200;
        _httpContext.Request.Path = "/api/test";

        await _middleware.InvokeAsync(_httpContext, _jwtTokenService, _userStorage);

        await _next.Received(1).Invoke(_httpContext);
    }
}
