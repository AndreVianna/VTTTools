namespace VttTools.WebApp.Components;

public class PublicComponentTests
    : WebAppTestContext {

    private sealed class TestComponent : PublicComponent {
        protected override async Task<bool> ConfigureComponentAsync() {
            await Task.Delay(200);
            return true;
        }
    }

    [Fact]
    public void WhenRendered_AndNotAuthorized_CurrentUserIsNull() {
        // Act
        var component = RenderComponent<TestComponent>();

        // Assert
        component.Instance.IsReady.Should().BeFalse();
        component.Instance.CurrentLocation.Should().Be("");
        component.Instance.CurrentUser.Should().BeNull();
    }

    [Fact]
    public void WhenRendered_AndAuthorized_HasCurrentUser() {
        // Arrange
        EnsureAuthenticated();

        // Act
        var component = RenderComponent<TestComponent>();

        // Assert
        component.Instance.CurrentUser.Should().NotBeNull();
        component.Instance.CurrentUser.Id.Should().Be(CurrentUser!.Id);
        component.Instance.CurrentUser.IsAdministrator.Should().BeFalse();
        component.Instance.CurrentUser.HasPassword.Should().BeTrue();
    }

    [Fact]
    public void WhenRendered_AndAuthorizedAsAdministrator_CurrentUserIsAdministrator() {
        // Arrange
        EnsureAuthenticated(true);

        // Act
        var component = RenderComponent<TestComponent>();

        // Assert
        component.Instance.CurrentUser.Should().NotBeNull();
        component.Instance.CurrentUser.IsAdministrator.Should().BeTrue();
    }

    [Fact]
    public void WhenReady_IsReady() {
        // Act
        var component = RenderComponent<TestComponent>();
        component.WaitForState(() => component.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        component.Instance.IsReady.Should().BeTrue();
    }

    [Fact]
    public void WhenRendered_WithUserWithNoDisplayName_UsesUserName() {
        // Arrange
        EnsureAuthenticated();
        CurrentUser!.DisplayName = null;

        // Act
        var component = RenderComponent<TestComponent>();

        // Assert
        component.Instance.CurrentUser!.DisplayName.Should().Be(CurrentUser!.Name);
    }
}