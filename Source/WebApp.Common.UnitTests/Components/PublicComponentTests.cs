namespace VttTools.WebApp.Components;

public class PublicComponentTests
    : ComponentTestContext {
    private sealed class TestComponent
        : Component {
        protected override async Task ConfigureAsync() {
            await Task.Delay(200);
            await base.ConfigureAsync();
        }
    }

    [Fact]
    public void WhenRendered_AndNotAuthorized_CurrentUserIsNull() {
        // Act
        var component = RenderComponent<TestComponent>();

        // Assert
        component.Instance.IsReady.Should().BeFalse();
        component.Instance.CurrentLocation.Should().Be("");
        component.Instance.User.Should().BeNull();
    }

    [Fact]
    public void WhenRendered_AndAuthorized_HasCurrentUser() {
        // Arrange
        EnsureAuthenticated();

        // Act
        var component = RenderComponent<TestComponent>();
        component.WaitForState(() => component.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        component.Instance.User.Should().NotBeNull();
        component.Instance.User.Id.Should().Be(CurrentUser!.Id);
        component.Instance.User.DisplayName.Should().Be(CurrentUser!.DisplayName);
        component.Instance.User.IsAdministrator.Should().BeFalse();
    }

    [Fact]
    public void WhenRendered_AndAuthorizedAsAdministrator_CurrentUserIsAdministrator() {
        // Arrange
        EnsureAuthenticated(true);

        // Act
        var component = RenderComponent<TestComponent>();
        component.WaitForState(() => component.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Assert
        component.Instance.User.Should().NotBeNull();
        component.Instance.User.Id.Should().NotBeEmpty();
        component.Instance.User.IsAdministrator.Should().BeTrue();
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
        component.Instance.User.Should().NotBeNull();
        component.Instance.User.DisplayName.Should().Be(CurrentUser!.Name);
    }
}