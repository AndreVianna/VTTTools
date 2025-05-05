using BUnitContext = Bunit.TestContext;

namespace VttTools.WebApp.TestUtilities;

public class WebAppTestContext
    : BUnitContext {
    private readonly List<ClaimsIdentity> _identities = [];

    public WebAppTestContext() {
        Options = new();

        var principal = new ClaimsPrincipal(_identities);
        var authenticationState = new AuthenticationState(principal);
        Services.AddCascadingValue(_ => Task.FromResult(authenticationState));

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
        httpContextAccessor.HttpContext.Returns(HttpContext);
        Services.AddSingleton(httpContextAccessor);
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

        NavigationManager = new(this);
        Services.AddSingleton<NavigationManager>(_ => NavigationManager);

        Options.UseAnonymousUser();
        SetAuthorization();
        SetCurrentLocation();
    }

    protected WebAppTestContextOptions Options { get; }
    protected CurrentUser? CurrentUser { get; private set; }
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
    protected void UseDefaultUser() {
        Options.UseDefaultUser();
        SetAuthorization();
        SetCurrentUser();
    }

    [MemberNotNull(nameof(CurrentUser))]
    protected void UseDefaultAdministrator() {
        Options.UseDefaultUser(true);
        SetAuthorization();
        SetCurrentUser();
    }

    [MemberNotNull(nameof(CurrentUser))]
    private void SetCurrentUser() => CurrentUser = new() {
        Id = Options.CurrentUser!.Id,
        DisplayName = Options.CurrentUser.DisplayName ?? Options.CurrentUser.Name,
        Email = Options.CurrentUser.Email!,
        IsAuthenticated = true,
        IsAdministrator = Options.IsAdministrator,
    };

    private void SetAuthorization() {
        var authResult = AuthorizationResult.Failed();
        _identities.Clear();
        if (Options.CurrentUser is not null) {
            var identityClaim = new Claim(ClaimTypes.NameIdentifier, Options.CurrentUser.Id.ToString());
            var nameClaim = new Claim(ClaimTypes.GivenName, Options.CurrentUser.DisplayName ?? Options.CurrentUser.Name);
            var emailClaim = new Claim(ClaimTypes.Email, Options.CurrentUser.Email ?? string.Empty);
            var roleClaim = new Claim(ClaimTypes.Role, Options.IsAdministrator ? "Administrator" : "User");
            var identity = new ClaimsIdentity([identityClaim, emailClaim, nameClaim, roleClaim]);
            _identities.Add(identity);
            authResult = AuthorizationResult.Success();
        }

        Authorization.AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
                     .Returns(authResult);
        UserManager.ClearSubstitute(ClearOptions.ReturnValues);
        UserManager.GetUserAsync(Arg.Any<ClaimsPrincipal>()).Returns(Options.CurrentUser);
        UserManager.IsInRoleAsync(Arg.Any<User>(), "User").Returns(Options.CurrentUser is not null);
        UserManager.IsInRoleAsync(Arg.Any<User>(), "Administrator").Returns(Options.IsAdministrator);
    }

    protected void SetCurrentLocation(string? location = null) {
        if (location is not null && Uri.IsWellFormedUriString(location, UriKind.Relative))
            NavigationManager.NavigateTo(location);
    }

    protected override void Dispose(bool disposing) {
        if (disposing)
            UserManager.Dispose();
        base.Dispose(disposing);
    }
}