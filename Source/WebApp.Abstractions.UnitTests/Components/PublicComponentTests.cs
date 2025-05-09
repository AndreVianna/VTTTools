namespace VttTools.WebApp.Components;

public class PublicComponentTests
    : ComponentTestContext {
    private sealed class TestComponent
        : PublicComponent {
        protected override async Task<bool> ConfigureAsync() {
            await Task.Delay(200);
            return await base.ConfigureAsync();
        }
    }

    [Fact]
    public void WhenRendered_AndNotAuthorized_CurrentUserIsNull() {
        // Act
        var component = RenderComponent<TestComponent>();

        // Assert
        component.Instance.IsReady.Should().BeFalse();
        component.Instance.CurrentLocation.Should().Be("");
        component.Instance.UserId.Should().BeNull();
        component.Instance.UserDisplayName.Should().BeNull();
        component.Instance.UserIsAdministrator.Should().BeFalse();
    }

    [Fact]
    public void WhenRendered_AndAuthorized_HasCurrentUser() {
        // Arrange
        EnsureAuthenticated();

        // Act
        var component = RenderComponent<TestComponent>();
        component.WaitForState(() => component.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        component.Instance.UserId.Should().Be(CurrentUser!.Id);
        component.Instance.UserDisplayName.Should().Be(CurrentUser!.DisplayName);
        component.Instance.UserIsAdministrator.Should().BeFalse();
    }

    [Fact]
    public void WhenRendered_AndAuthorizedAsAdministrator_CurrentUserIsAdministrator() {
        // Arrange
        EnsureAuthenticated(true);

        // Act
        var component = RenderComponent<TestComponent>();
        component.WaitForState(() => component.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        component.Instance.UserId.Should().NotBeNull();
        component.Instance.UserIsAdministrator.Should().BeTrue();
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
        DefaultUser.DisplayName = null;
        EnsureAuthenticated();

        // Act
        var component = RenderComponent<TestComponent>();
        component.WaitForState(() => component.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        component.Instance.UserDisplayName.Should().Be(CurrentUser!.Name);
    }
}