namespace VttTools.WebApp.Components;

public class NavMenuTests
    : ComponentTestContext {
    [Fact]
    public void WithAuthenticatedUser_ShowsUserMenu() {
        // Arrange
        EnsureAuthenticated();

        // Act
        var cut = RenderComponent<NavMenu>();

        // Assert
        var displayName = cut.Instance.User!.DisplayName;
        cut.Markup.Should().Contain("Logout");
        cut.Markup.Should().Contain(displayName);
        cut.Markup.Should().Contain("Library");
        cut.Markup.Should().Contain("Adventures");
    }

    [Fact]
    public void WithNotAuthenticatedUser_ShowsGuestMenu() {
        // Act
        var cut = RenderComponent<NavMenu>();

        // Assert
        cut.Markup.Should().Contain("Register");
        cut.Markup.Should().Contain("Login");
    }

    [Fact]
    public void OnLocationChanged_UpdatesCurrentUrl() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>();
        var cut = RenderComponent<NavMenu>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        navigationManager.NavigateTo("/new_location");

        // Assert
        cut.Instance.CurrentLocation.Should().Be("new_location");
    }
}