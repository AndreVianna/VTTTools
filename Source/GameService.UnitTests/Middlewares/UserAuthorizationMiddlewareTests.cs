namespace VttTools.GameService.Middlewares;

public class UserAuthorizationMiddlewareTests {
    private readonly RequestDelegate _next;
    private readonly UserAuthorizationMiddleware _middleware;
    private readonly HttpContext _httpContext;

    public UserAuthorizationMiddlewareTests() {
        var policyProvider = Substitute.For<IAuthorizationPolicyProvider>();
        var logger = Substitute.For<ILogger<AuthorizationMiddleware>>();
        _next = Substitute.For<RequestDelegate>();

        // Create the middleware with a ServiceProvider that can resolve the AuthorizationMiddleware
        var serviceProvider = Substitute.For<IServiceProvider>();
        _middleware = new(_next, policyProvider, serviceProvider, logger);

        // Setup mock http context
        _httpContext = new DefaultHttpContext();
    }

    [Fact]
    public async Task Invoke_WithBasicAuth_SetsUserIdentity() {
        // Arrange
        const string userId = "user123";
        _httpContext.Request.Headers.Authorization = $"Basic {userId}";

        // Act
        await _middleware.Invoke(_httpContext);

        // Assert
        _httpContext.User.Should().NotBeNull();
        _httpContext.User.Identity.Should().NotBeNull();
        _httpContext.User.Identity!.IsAuthenticated.Should().BeTrue();
        _httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier).Should().Be(userId);
    }

    [Fact]
    public async Task Invoke_WithoutBasicAuth_DoesNotSetUserIdentity() {
        // Arrange
        var originalUser = _httpContext.User;

        // Act
        await _middleware.Invoke(_httpContext);

        // Assert
        _httpContext.User.Should().Be(originalUser);
    }

    [Fact]
    public async Task Invoke_WithOtherAuthScheme_DoesNotSetUserIdentity() {
        // Arrange
        var originalUser = _httpContext.User;
        _httpContext.Request.Headers.Authorization = "Bearer token123";

        // Act
        await _middleware.Invoke(_httpContext);

        // Assert
        _httpContext.User.Should().Be(originalUser);
    }

    [Fact]
    public async Task Invoke_WithIncompleteAuthHeader_DoesNotSetUserIdentity() {
        // Arrange
        var originalUser = _httpContext.User;
        _httpContext.Request.Headers.Authorization = "Basic";

        // Act
        await _middleware.Invoke(_httpContext);

        // Assert
        _httpContext.User.Should().Be(originalUser);
    }

    [Fact]
    public async Task Invoke_CallsNextDelegate() {
        // Arrange
        _httpContext.Request.Headers.Authorization = "Basic user123";

        // Act
        await _middleware.Invoke(_httpContext);

        // Assert
        await _next.Received(1).Invoke(Arg.Is<HttpContext>(ctx => ctx == _httpContext));
    }
}