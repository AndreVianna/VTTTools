namespace VttTools.WebApp.Components;

public class ExtendedComponentTests
    : WebAppTestContext {
    [Fact]
    public void OnInitializedAsync_SetsDefaultValues() {
        // Arrange
        UseDefaultUser();
        var expectedCurrentUser = new CurrentUser {
            Id = Options.CurrentUser!.Id,
            DisplayName = Options.CurrentUser.DisplayName!,
            IsAuthenticated = true,
            IsAdministrator = false,
        };

        // Act
        var component = RenderComponent<ExtendedComponent>();

        // Assert
        component.Instance.CurrentLocation.Should().Be("");
        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
    }

    [Fact]
    public void OnInitializedAsync_WhenUserDisplayNameIsNull_SetsDisplayNameToUserName() {
        // Arrange
        UseDefaultUser();
        Options.CurrentUser!.DisplayName = null;
        var expectedCurrentUser = new CurrentUser {
            Id = Options.CurrentUser.Id,
            DisplayName = Options.CurrentUser.Name,
            IsAuthenticated = true,
            IsAdministrator = false,
        };

        // Act
        var component = RenderComponent<ExtendedComponent>();

        // Assert
        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
    }

    [Fact]
    public void OnInitializedAsync_WhenUserIsNull_SetsDisplayNameToEmpty() {
        // Arrange
        var expectedCurrentUser = new CurrentUser {
            Id = Guid.Empty,
            DisplayName = string.Empty,
            IsAuthenticated = false,
            IsAdministrator = false,
        };

        // Act
        var component = RenderComponent<ExtendedComponent>();

        // Assert
        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
    }

    [Fact]
    public void OnInitializedAsync_WhenUserIsAdministrator_SetsIsAdministratorToTrue() {
        // Arrange
        UseDefaultAdministrator();
        var expectedCurrentUser = new CurrentUser {
            Id = Options.CurrentUser!.Id,
            DisplayName = Options.CurrentUser.DisplayName!,
            IsAuthenticated = true,
            IsAdministrator = true,
        };

        // Act
        var component = RenderComponent<ExtendedComponent>();

        // Assert
        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
    }
}