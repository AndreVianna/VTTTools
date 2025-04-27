namespace VttTools.WebApp.TestUtilities;

public class WebAppTestContext : TestContext {
    private readonly IAuthorizationService _authService;
    private readonly UserManager<User> _userManager;
    private readonly List<ClaimsIdentity> _identities = [];
    private readonly FakeNavigationManager _navigationManager;

    public WebAppTestContext() {
        Options = new();
        var httpContext = Substitute.For<HttpContext>();
        Services.AddCascadingValue(_ => httpContext);

        var principal = new ClaimsPrincipal(_identities);
        var authenticationState = new AuthenticationState(principal);
        Services.AddCascadingValue(_ => Task.FromResult(authenticationState));

        var authorizationPolicyProvider = Substitute.For<IAuthorizationPolicyProvider>();
        var requirement = Substitute.For<IAuthorizationRequirement>();
        var requirements = new List<IAuthorizationRequirement> { requirement };
        const string defaultSchemeName = "Default";
        var schemes = new List<string> { defaultSchemeName };
        var policy = new AuthorizationPolicy(requirements, schemes);
        authorizationPolicyProvider.GetDefaultPolicyAsync().Returns(policy);

        Services.AddSingleton(authorizationPolicyProvider);

        _authService = Substitute.For<IAuthorizationService>();
        Services.AddSingleton(_authService);

        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        Services.AddSingleton(httpContextAccessor);

        var userStore = Substitute.For<IUserStore<User>>();
        var options = Substitute.For<IOptions<IdentityOptions>>();
        var identityOptions = new IdentityOptions();
        options.Value.Returns(identityOptions);
        var passwordHasher = Substitute.For<IPasswordHasher<User>>();
        var userValidator = Substitute.For<IUserValidator<User>>();
        var userValidators = new List<IUserValidator<User>> { userValidator };
        var passwordValidator = Substitute.For<IPasswordValidator<User>>();
        var passwordValidators = new List<IPasswordValidator<User>> { passwordValidator };
        var lookupNormalizer = Substitute.For<ILookupNormalizer>();
        var identityErrorDescriber = new IdentityErrorDescriber();
        var logger = Substitute.For<ILogger<UserManager<User>>>();
        _userManager = Substitute.For<UserManager<User>>(userStore, options, passwordHasher, userValidators, passwordValidators, lookupNormalizer, identityErrorDescriber, Services, logger);
        Services.AddSingleton(_userManager);

        var userAccessor = Substitute.For<IIdentityUserAccessor>();
        Services.AddSingleton(userAccessor);

        _navigationManager = new(this);
        Services.AddSingleton<NavigationManager>(_navigationManager);

        Options.UseAnonymousUser();
        SetAuthentication();
        SetCurrentLocation();
    }

    public WebAppTestContextOptions Options { get; }

    protected void UseDefaultUser() {
        Options.UseDefaultUser();
        SetAuthentication();
    }

    protected void UseDefaultAdministrator() {
        Options.UseDefaultAdministrator();
        SetAuthentication();
    }

    protected void SetCurrentUser(User user, bool isAdministrator = false) {
        Options.SetCurrentUser(user, isAdministrator);
        SetAuthentication();
    }

    protected void SetCurrentUser(Action<User> setup, bool isAdministrator = false) {
        Options.SetCurrentUser(setup, isAdministrator);
        SetAuthentication();
    }

    private void SetAuthentication() {
        Options.IsAuthenticated = Options.IsAuthenticated || Options.IsAdministrator;
        Options.CurrentUser = Options.IsAuthenticated
                                  ? Options.CurrentUser ?? WebAppTestContextOptions.DefaultUser
                                  : null!;
        Options.CurrentUserRole = Options.IsAdministrator ? "Administrator"
                                : Options.IsAuthenticated ? "User"
                                : Options.CurrentUserRole ?? "Guest";
        _identities.Clear();
        if (Options.IsAuthenticated) {
            var identityClaim = new Claim(ClaimTypes.NameIdentifier, Options.CurrentUser.Id.ToString());
            var nameClaim = new Claim(ClaimTypes.GivenName, Options.CurrentUser.DisplayName ?? Options.CurrentUser.Name);
            var emailClaim = new Claim(ClaimTypes.Email, Options.CurrentUser.Email!);
            var roleClaim = new Claim(ClaimTypes.Role, Options.CurrentUserRole);
            var identity = new ClaimsIdentity([identityClaim, emailClaim, nameClaim, roleClaim]);
            _identities.Add(identity);
        }

        var authResult = Options.IsAuthenticated ? AuthorizationResult.Success() : AuthorizationResult.Failed();
        _authService.ClearSubstitute(ClearOptions.ReturnValues);
        _authService.AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
                    .Returns(authResult);
        _userManager.ClearSubstitute(ClearOptions.ReturnValues);
        _userManager.GetUserAsync(Arg.Any<ClaimsPrincipal>())
                    .Returns(Options.CurrentUser);
        _userManager.IsInRoleAsync(Arg.Any<User>(), Options.CurrentUserRole)
                    .Returns(true);
    }

    protected void SetCurrentLocation(string? location = null) {
        if (location is not null && Uri.IsWellFormedUriString(location, UriKind.Relative))
            _navigationManager.NavigateTo(location);
    }

    protected void ConfigureTestContext() {
        Options.IsAuthenticated = Options.IsAuthenticated || Options.IsAdministrator;
        Options.CurrentUser = Options.IsAuthenticated
                                  ? Options.CurrentUser
                                  : null!;
        var role = Options.IsAdministrator
                       ? "Administrator"
                       : Options.IsAuthenticated
                           ? "User"
                           : "Guest";
        if (Options.IsAuthenticated) {
            var identityClaim = new Claim(ClaimTypes.NameIdentifier, Options.CurrentUser.Id.ToString());
            var nameClaim = new Claim(ClaimTypes.GivenName, Options.CurrentUser.DisplayName ?? Options.CurrentUser.Name);
            var emailClaim = new Claim(ClaimTypes.Email, Options.CurrentUser.Email!);
            var roleClaim = new Claim(ClaimTypes.Role, role);
            var identity = new ClaimsIdentity([identityClaim, emailClaim, nameClaim, roleClaim]);
            _identities.Add(identity);
        }

        var authResult = Options.IsAuthenticated ? AuthorizationResult.Success() : AuthorizationResult.Failed();
        _authService.AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
                    .Returns(authResult);
        _userManager.GetUserAsync(Arg.Any<ClaimsPrincipal>())
                    .Returns(Options.CurrentUser);
        _userManager.IsInRoleAsync(Arg.Any<User>(), role)
                    .Returns(true);
    }

    protected static void WaitForState(Func<bool> predicate, int timeoutMs = 1000) {
        var startTime = DateTime.Now;
        while (!predicate() && (DateTime.Now - startTime).TotalMilliseconds < timeoutMs)
            Thread.Sleep(10);

        predicate().Should().BeTrue($"Timed out waiting for state to update within {timeoutMs}ms");
    }
}
