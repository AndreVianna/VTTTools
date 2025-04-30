using System.Diagnostics.CodeAnalysis;

namespace VttTools.WebApp.TestUtilities;

public class WebAppTestContext
    : Bunit.TestContext {
    private readonly IAuthorizationService _authService;
    private readonly UserManager<User> _userManager;
    private readonly List<ClaimsIdentity> _identities = [];
    private readonly FakeNavigationManager _navigationManager;

    public WebAppTestContext() {
        //Context = Xunit.TestContext.Current;
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
    public CurrentUser? CurrentUser { get; private set; }
    //protected ITestContext Context { get; }

    [MemberNotNull(nameof(CurrentUser))]
    protected void UseDefaultUser() {
        Options.UseDefaultUser();
        SetAuthentication();
        SetCurrentUser();
    }

    [MemberNotNull(nameof(CurrentUser))]
    protected void UseDefaultAdministrator() {
        Options.UseDefaultUser(true);
        SetAuthentication();
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

    private void SetAuthentication() {
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

        _authService.ClearSubstitute(ClearOptions.ReturnValues);
        _authService.AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
                    .Returns(authResult);
        _userManager.ClearSubstitute(ClearOptions.ReturnValues);
        _userManager.GetUserAsync(Arg.Any<ClaimsPrincipal>()).Returns(Options.CurrentUser);
        _userManager.IsInRoleAsync(Arg.Any<User>(), "User").Returns(Options.CurrentUser is not null);
        _userManager.IsInRoleAsync(Arg.Any<User>(), "Administrator").Returns(Options.IsAdministrator);
    }

    protected void SetCurrentLocation(string? location = null) {
        if (location is not null && Uri.IsWellFormedUriString(location, UriKind.Relative))
            _navigationManager.NavigateTo(location);
    }

    protected override void Dispose(bool disposing) {
        if (disposing)
            _userManager.Dispose();
        base.Dispose(disposing);
    }
}