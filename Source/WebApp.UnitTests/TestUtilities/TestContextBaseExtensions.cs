//namespace VttTools.WebApp.TestUtilities;

//public static class TestContextBaseExtensions {
//    private static readonly User _defaultUser = new() {
//        Name = "Test User Name",
//        DisplayName = "Test User Display Name",
//        UserName = "TEST.USER@HOST.COM",
//        NormalizedUserName = "TEST.USER@HOST.COM",
//        Email = "test.user@host.com",
//        NormalizedEmail = "test.user@host.com",
//        EmailConfirmed = true,
//        PhoneNumber = "212-555-1234",
//        PhoneNumberConfirmed = true,
//        PasswordHash = "[SomeFakePasswordHash]",
//        TwoFactorEnabled = false,
//        LockoutEnabled = true,
//        ConcurrencyStamp = "d23847f6-5241-4656-85de-d3c3ee2d66b8",
//        SecurityStamp = "f0d0bd5d-8e64-419c-a856-e0e6364d26a1"
//    };
//    internal static void Configure(this TestContextBase context, Action<TestContextBaseOptions>? setup = null) {
//        // I am adding all the values very explicitly to allow to more flexible configuration in the future.
//        var contextOptions = new TestContextBaseOptions();
//        setup?.Invoke(contextOptions);

//        var httpContext = Substitute.For<HttpContext>();
//        context.Services.AddCascadingValue(_ => httpContext);

//        var identities = new List<ClaimsIdentity>();
//        var user = contextOptions.EnsureAuthenticated
//                    ? contextOptions.CurrentUser ?? _defaultUser
//                    : contextOptions.CurrentUser;
//        if (user is not null) {
//            var identityClaim = new Claim(ClaimTypes.NameIdentifier, user.Id.ToString());
//            var nameClaim = new Claim(ClaimTypes.GivenName, user.DisplayName ?? user.Name);
//            var identity = new ClaimsIdentity([identityClaim, nameClaim]);
//            identities.Add(identity);
//        }
//        var principal = new ClaimsPrincipal(identities);
//        var authenticationState = new AuthenticationState(principal);
//        context.Services.AddCascadingValue(_ => Task.FromResult(authenticationState));

//        var authorizationPolicyProvider = Substitute.For<IAuthorizationPolicyProvider>();
//        var requirement = Substitute.For<IAuthorizationRequirement>();
//        var requirements = new List<IAuthorizationRequirement> { requirement };
//        const string defaultSchemeName = "Default";
//        var schemes = new List<string> { defaultSchemeName };
//        var policy = new AuthorizationPolicy(requirements, schemes);
//        authorizationPolicyProvider.GetDefaultPolicyAsync().Returns(policy);
//        context.Services.AddSingleton(authorizationPolicyProvider);

//        var authService = Substitute.For<IAuthorizationService>();
//        context.Services.AddSingleton(authService);

//        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
//        context.Services.AddSingleton(httpContextAccessor);

//        var userStore = Substitute.For<IUserStore<User>>();
//        var options = Substitute.For<IOptions<IdentityOptions>>();
//        var identityOptions = new IdentityOptions();
//        options.Value.Returns(identityOptions);
//        var passwordHasher = Substitute.For<IPasswordHasher<User>>();
//        var userValidator = Substitute.For<IUserValidator<User>>();
//        var userValidators = new List<IUserValidator<User>> { userValidator };
//        var passwordValidator = Substitute.For<IPasswordValidator<User>>();
//        var passwordValidators = new List<IPasswordValidator<User>> { passwordValidator };
//        var lookupNormalizer = Substitute.For<ILookupNormalizer>();
//        var identityErrorDescriber = new IdentityErrorDescriber();
//        var logger = Substitute.For<ILogger<UserManager<User>>>();
//        var userManager = Substitute.For<UserManager<User>>(userStore, options, passwordHasher, userValidators, passwordValidators, lookupNormalizer, identityErrorDescriber, context.Services, logger);
//        context.Services.AddSingleton(userManager);

//        var userAccessor = Substitute.For<IIdentityUserAccessor>();
//        context.Services.AddSingleton(userAccessor);

//        var fakeNavigationManager = new FakeNavigationManager(context);
//        context.Services.AddSingleton<NavigationManager>(fakeNavigationManager);

//        // configure default mocks
//        authService.AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
//                   .Returns(AuthorizationResult.Success());
//        userManager.GetUserAsync(Arg.Any<ClaimsPrincipal>())
//                   .Returns(contextOptions.CurrentUser);

//        // set the current location to the fake navigation manager
//        fakeNavigationManager.NavigateTo(contextOptions.CurrentLocation?.AbsoluteUri ?? "http://host.com/page");
//    }
//}
