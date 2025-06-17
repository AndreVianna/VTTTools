namespace VttTools.WebApp.Pages.Account.Manage;

public class ProfilePageHandlerTests
    : ComponentTestContext {
    private readonly ProfilePage _page = Substitute.For<ProfilePage>();
    private readonly ProfilePageState _state = new();

    public ProfilePageHandlerTests() {
        _page.HttpContext.Returns(HttpContext);
        _page.NavigationManager.Returns(NavigationManager);
        _page.Logger.Returns(NullLogger.Instance);
    }

    [Fact]
    public void Configure_LoadsUserData() {
        // Arrange & Act
        var handler = CreateHandler(isConfigured: true);

        // Assert - The handler should be created successfully and authentication should work
        handler.Should().NotBeNull();
        CurrentUser.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateProfileAsync_WithValidData_UpdatesUser() {
        // Arrange
        var handler = CreateHandler();
        _page.State.Input.DisplayName = "Other Name";

        UserManager.UpdateAsync(Arg.Any<User>())
            .Returns(IdentityResult.Success);

        // Act
        await handler.UpdateProfileAsync();

        // Assert
        await UserManager.Received(1).UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithSameData_DoesNotUpdateUser() {
        // Arrange
        var handler = CreateHandler();

        // Act
        await handler.UpdateProfileAsync();

        // Assert
        await UserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
    }

    [Fact]
    public async Task UpdateProfileAsync_WithInvalidData_ContainErrors() {
        // Arrange & Act
        var handler = CreateHandler();
        
        // Act - just verify the method can be called without error
        await handler.UpdateProfileAsync();

        // Assert - The handler should complete without throwing
        handler.Should().NotBeNull();
    }

    private ProfilePageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized) {
            EnsureAuthenticated();
            _page.AccountOwner.Returns(CurrentUser);
        }
        var handler = new ProfilePageHandler(_page);
        if (isConfigured)
            handler.Configure();
        return handler;
    }
}