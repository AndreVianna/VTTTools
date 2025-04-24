namespace VttTools.WebApp.Components;

public class NavMenuTests : Bunit.TestContext {
    private readonly User _testUser;
    private readonly UserManager<User> _userManager;
    private readonly CascadingValueSource<HttpContext> _cascadingContext;
    private readonly FakeNavigationManager _navigationManagerSpy;

    [SuppressMessage("CodeQuality", "IDE0079:Remove unnecessary suppression", Justification = "Testing")]
    [SuppressMessage("Usage", "BL0005:Component parameter should not be set outside of its component.", Justification = "Testing")]
    public NavMenuTests() {
        _testUser = new() {
            Id = Guid.NewGuid(),
            Name = "Test User",
            DisplayName = "Test Display",
        };
        var httpContext = Substitute.For<HttpContext>();
        _cascadingContext = new(httpContext, true);

        _userManager = Substitute.For<UserManager<User>>(Substitute.For<IUserStore<User>>(), null, null, null, null, null, null, null, null);
        _userManager.GetUserAsync(Arg.Any<ClaimsPrincipal>()).Returns(_testUser);
        Services.AddSingleton(_userManager);

        var userAccessor = Substitute.For<IdentityUserAccessor>();
        Services.AddSingleton(userAccessor);

        _navigationManagerSpy = new(this);
        _navigationManagerSpy.NavigateTo("http://host.com");
        Services.AddSingleton<NavigationManager>(_navigationManagerSpy);
        var cascadingValue = new CascadingValue<HttpContext> { Value = httpContext };
        Services.AddSingleton(cascadingValue);
    }

    [Fact]
    public void OnLocationChanged_UpdatesCurrentUrl() {
        // Arrange
        var navManager = Services.GetRequiredService<NavigationManager>();
        var component = RenderComponent<NavMenu>(builder => builder.AddCascadingValue(_cascadingContext));

        // Act
        navManager.NavigateTo("/newTest");

        // Assert
        component.Instance.CurrentLocation.Should().Be("newTest");
    }

    [Fact]
    public void LoadMenu_SetsDefaultValues() {
        // Act
        var component = RenderComponent<NavMenu>(builder => builder.AddCascadingValue(_cascadingContext));

        // Assert
        component.Instance.CurrentLocation.Should().Be("");
        component.Instance.CurrentUser.Should().Be("Test Display");
    }

    [Fact]
    public void LoadMenu_WhenDisplayNameIsNull_SetsUserNameFromName() {
        // Arrange
        _testUser.DisplayName = null;

        // Act
        var component = RenderComponent<NavMenu>(builder => builder.AddCascadingValue(_cascadingContext));

        // Assert
        component.Instance.CurrentUser.DisplayName.Should().Be("Test User");
    }

    [Fact]
    public void LoadMenu_WhenUserIsNul_SetsEmptyUserName() {
        // Arrange
        _userManager.GetUserAsync(Arg.Any<ClaimsPrincipal>()).Returns((User?)null);

        // Act
        var component = RenderComponent<NavMenu>(builder => builder.AddCascadingValue(_cascadingContext));

        // Assert
        component.Instance.CurrentUser.DisplayName.Should().BeEmpty();
    }

    [Fact]
    public void Dispose_UnregistersLocationChangedEvent() {
        // Arrange
        var component = RenderComponent<NavMenu>(builder => builder.AddCascadingValue(_cascadingContext));

        // Act
        component.Instance.Dispose();

        // Assert
        _navigationManagerSpy.Received(1).LocationChanged -= Arg.Any<EventHandler<LocationChangedEventArgs>>();
    }
}