namespace VttTools.WebApp.Pages.Account.Manage;

public class ProfilePageHandlerTests
    : WebAppTestContext {
    public ProfilePageHandlerTests() {
        EnsureAuthenticated();
    }

    [Fact]
    public void Configure_LoadsUserData() {
        // Arrange
        var handler = CreateHandler(isConfigured: false);

        // Act
        handler.Configure();

        // Assert
        handler.State.Input.DisplayName.Should().Be(CurrentUser!.DisplayName);
        handler.State.Input.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateProfileAsync_WithValidData_UpdatesUser() {
        // Arrange
        var handler = CreateHandler();
        handler.State.Input.DisplayName = "Other Name";

        UserManager.UpdateAsync(Arg.Any<User>())
            .Returns(IdentityResult.Success);

        // Act
        await handler.UpdateProfileAsync();

        // Assert
        await UserManager.Received(1).UpdateAsync(Arg.Any<User>());
        HttpContext.Received(1).SetStatusMessage("Your profile has been updated.");
    }

    [Fact]
    public async Task UpdateProfileAsync_WithSameData_DoesNotUpdateUser() {
        // Arrange
        var handler = CreateHandler();

        // Act
        await handler.UpdateProfileAsync();

        // Assert
        await UserManager.DidNotReceive().UpdateAsync(Arg.Any<User>());
        HttpContext.Received(1).SetStatusMessage("No changes were made to your profile.");
    }

    [Fact]
    public async Task UpdateProfileAsync_WithInvalidData_ContainErrors() {
        // Arrange
        var handler = CreateHandler();

        handler.State.Input.DisplayName = "Invalid Name";

        var error = new IdentityError { Description = "Invalid display name." };
        UserManager.UpdateAsync(Arg.Any<User>())
            .Returns(IdentityResult.Failed(error));

        // Act
        await handler.UpdateProfileAsync();

        // Assert
        await UserManager.Received(1).UpdateAsync(Arg.Any<User>());
        handler.State.Input.Errors.Should().ContainSingle().Which.Message.Should().Be("Invalid display name.");
        HttpContext.Received(1).SetStatusMessage("Error: Failed to update user profile.");
    }

    private ProfilePageHandler CreateHandler(bool isAuthorized = true, bool isConfigured = true) {
        if (isAuthorized)
            EnsureAuthenticated();
        var page = Substitute.For<IAccountPage>();
        page.CurrentUser.Returns(CurrentUser);
        page.HttpContext.Returns(HttpContext);
        page.NavigationManager.Returns(NavigationManager);
        page.Logger.Returns(NullLogger.Instance);
        var handler = new ProfilePageHandler(page);
        if (isConfigured)
            handler.Configure();
        return handler;
    }
}