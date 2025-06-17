namespace VttTools.WebApp.TestUtilities;

public class ComponentTestContext
    : BUnitContext {
    public User DefaultUser { get; } = new() {
        Name = "Name",
        DisplayName = "Background Name",
        UserName = "test.user@host.com",
        NormalizedUserName = "TEST.USER@HOST.COM",
        Email = "test.user@host.com",
        NormalizedEmail = "TEST.USER@HOST.COM",
        EmailConfirmed = true,
        PhoneNumber = "212-555-1234",
        PhoneNumberConfirmed = true,
        PasswordHash = "[SomeFakePasswordHash]",
        TwoFactorEnabled = false,
        LockoutEnabled = true,
        ConcurrencyStamp = "d23847f6-5241-4656-85de-d3c3ee2d66b8",
        SecurityStamp = "f0d0bd5d-8e64-419c-a856-e0e6364d26a1",
    };

    public ComponentTestContext() {
        var requirement = Substitute.For<IAuthorizationRequirement>();
        var requirements = new List<IAuthorizationRequirement> { requirement };
        const string defaultSchemeName = "Default";
        var schemes = new List<string> { defaultSchemeName };
        var policy = new AuthorizationPolicy(requirements, schemes);

        var authorizationPolicyProvider = Substitute.For<IAuthorizationPolicyProvider>();
        authorizationPolicyProvider.GetDefaultPolicyAsync().Returns(Task.FromResult(policy));

        Services.AddSingleton(authorizationPolicyProvider);

        Authentication = Substitute.For<IAuthenticationService>();
        Services.AddSingleton(Authentication);
        Authorization = Substitute.For<IAuthorizationService>();
        Services.AddSingleton(Authorization);

        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        HttpContext = Substitute.For<HttpContext>();
        HttpContext.RequestServices = Services;
        
        // Set up Request and Response for SetStatusMessage extension
        var request = Substitute.For<HttpRequest>();
        var response = Substitute.For<HttpResponse>();
        var session = Substitute.For<ISession>();
        var requestCookies = Substitute.For<IRequestCookieCollection>();
        var responseCookies = Substitute.For<IResponseCookies>();
        
        request.Method.Returns("GET");
        request.Cookies.Returns(requestCookies);
        response.Cookies.Returns(responseCookies);
        HttpContext.Request.Returns(request);
        HttpContext.Response.Returns(response);
        HttpContext.Session.Returns(session);
        HttpContext.Items.Returns(new Dictionary<object, object?>());
        
        httpContextAccessor.HttpContext.Returns(HttpContext);
        Services.AddSingleton<IHttpContextAccessor>(httpContextAccessor);
        Services.AddCascadingValue(_ => HttpContext);

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
        var umLogger = Substitute.For<ILogger<UserManager<User>>>();
        UserManager = Substitute.For<UserManager<User>>(userStore, options, passwordHasher, userValidators, passwordValidators, lookupNormalizer, identityErrorDescriber, Services, umLogger);
        Services.AddScoped<UserManager<User>>(_ => UserManager);

        var principalFactory = Substitute.For<IUserClaimsPrincipalFactory<User>>();
        var smLogger = Substitute.For<ILogger<SignInManager<User>>>();
        var authProvider = Substitute.For<IAuthenticationSchemeProvider>();
        var userChecker = Substitute.For<IUserConfirmation<User>>();
        SignInManager = Substitute.For<SignInManager<User>>(UserManager, httpContextAccessor, principalFactory, options, smLogger, authProvider, userChecker);
        Services.AddScoped<SignInManager<User>>(_ => SignInManager);

        var userAccessor = Substitute.For<IIdentityUserAccessor>();
        Services.AddSingleton(userAccessor);

        NavigationManager = new FakeNavigationManager(this);
        Services.AddSingleton<NavigationManager>(_ => NavigationManager);

        SetAuthorization();
        SetCurrentLocation();
        
        // Add cascading AccountOwner for AccountPage components
        Services.AddCascadingValue("AccountOwner", _ => CurrentUser);
    }

    protected User? CurrentUser { get; private set; }
    protected HttpContext HttpContext { get; }
    protected UserManager<User> UserManager { get; }
    protected SignInManager<User> SignInManager { get; }
    protected FakeNavigationManager NavigationManager { get; }
    protected IAuthenticationService Authentication { get; }
    protected IAuthorizationService Authorization { get; }

#if XUNITV3
    protected static CancellationToken CancellationToken => Xunit.TestContext.Current.CancellationToken;
#else
    protected static CancellationToken CancellationToken => CancellationToken.None;
#endif

    [MemberNotNull(nameof(CurrentUser))]
    protected void EnsureAuthenticated(bool asAdministrator = false) {
        CurrentUser = CloneUser(DefaultUser, asAdministrator);
        SetAuthorization();
    }

    private static User CloneUser(User user, bool isAdministrator) => new() {
        Id = user.Id,
        Name = user.Name,
        DisplayName = user.DisplayName,
        UserName = user.UserName,
        NormalizedUserName = user.NormalizedUserName,
        Email = user.Email,
        NormalizedEmail = user.NormalizedEmail,
        EmailConfirmed = user.EmailConfirmed,
        PhoneNumber = user.PhoneNumber,
        PhoneNumberConfirmed = user.PhoneNumberConfirmed,
        PasswordHash = user.PasswordHash,
        TwoFactorEnabled = user.TwoFactorEnabled,
        LockoutEnabled = user.LockoutEnabled,
        ConcurrencyStamp = user.ConcurrencyStamp,
        SecurityStamp = user.SecurityStamp,
        IsAdministrator = isAdministrator,
    };

    private void SetAuthorization() {
        var authResult = AuthorizationResult.Failed();
        var principal = new ClaimsPrincipal();
        if (CurrentUser is not null) {
            var identityClaim = new Claim(ClaimTypes.NameIdentifier, CurrentUser.Id.ToString());
            var nameClaim = new Claim(ClaimTypes.GivenName, CurrentUser.DisplayName);
            var emailClaim = new Claim(ClaimTypes.Email, CurrentUser.Email);
            var roleClaim = new Claim(ClaimTypes.Role, CurrentUser.IsAdministrator ? "Administrator" : "User");
            var identity = new ClaimsIdentity([identityClaim, emailClaim, nameClaim, roleClaim], "test");
            principal.AddIdentity(identity);
            authResult = AuthorizationResult.Success();
        }
        HttpContext.User = principal;
        var authenticationState = new AuthenticationState(principal);
        Services.AddCascadingValue(_ => Task.FromResult(authenticationState));

        Authorization.AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
                     .Returns(authResult);
        UserManager.ClearSubstitute(ClearOptions.ReturnValues);
        UserManager.GetUserAsync(Arg.Any<ClaimsPrincipal>()).Returns(CurrentUser);
        UserManager.IsInRoleAsync(Arg.Any<User>(), "User").Returns(CurrentUser is not null);
        UserManager.IsInRoleAsync(Arg.Any<User>(), "Administrator").Returns(CurrentUser?.IsAdministrator ?? false);
        
        // Update cascading AccountOwner value
        if (CurrentUser is not null) {
            Services.AddCascadingValue("AccountOwner", _ => CurrentUser);
        }
    }

    protected void SetCurrentLocation(string? location = null) {
        if (location is not null && Uri.IsWellFormedUriString(location, UriKind.Relative))
            NavigationManager.NavigateTo(location);
    }

    // Removed SetupPageMock - configure mocks directly in test constructors

    protected override void Dispose(bool disposing) {
        if (disposing)
            UserManager.Dispose();
        base.Dispose(disposing);
    }
}