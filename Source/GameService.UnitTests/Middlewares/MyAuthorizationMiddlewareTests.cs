namespace VttTools.GameService.Middlewares;

public class MyAuthorizationMiddlewareTests {
    private readonly RequestDelegate _next;
    private readonly MyAuthorizationMiddleware _middleware;
    private readonly HttpContext _httpContext;
    private readonly IAuthorizationPolicyProvider _policyProvider;
    private readonly ILogger<AuthorizationMiddleware> _logger;
    private readonly IServiceProvider _serviceProvider;

    public MyAuthorizationMiddlewareTests() {
        _policyProvider = Substitute.For<IAuthorizationPolicyProvider>();
        _logger = Substitute.For<ILogger<AuthorizationMiddleware>>();
        _next = Substitute.For<RequestDelegate>();

        // Create the middleware with a ServiceProvider that can resolve the AuthorizationMiddleware
        _serviceProvider = Substitute.For<IServiceProvider>();
        _middleware = new MyAuthorizationMiddleware(_next, _policyProvider, _serviceProvider, _logger);

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