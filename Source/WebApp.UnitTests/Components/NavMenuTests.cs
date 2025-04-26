//namespace VttTools.WebApp.Components;

//public class NavMenuTests : Bunit.TestContext {
//    private readonly User _testUser = new() {
//        Id = Guid.NewGuid(),
//        Name = "Test Name",
//        DisplayName = "Test Display",
//    };

//    [Fact]
//    public void OnLocationChanged_UpdatesCurrentUrl() {
//        // Arrange
//        this.Configure(opt => opt.CurrentUser = _testUser);
//        var navManager = Services.GetRequiredService<NavigationManager>();
//        var component = RenderComponent<NavMenuComponent>();

//        // Act
//        navManager.NavigateTo("/newTest");

//        // Assert
//        component.Instance.CurrentLocation.Should().Be("newTest");
//    }

//    [Fact]
//    public void LoadMenu_SetsDefaultValues() {
//        // Arrange
//        this.Configure(opt => opt.CurrentUser = _testUser);
//        var expectedCurrentUser = new CurrentUser {
//            IsAuthenticated = true,
//            Id = _testUser.Id,
//            IsAdministrator = false,
//            DisplayName = _testUser.DisplayName!,
//        };

//        // Act
//        var component = RenderComponent<NavMenuComponent>();

//        // Assert
//        component.Instance.CurrentLocation.Should().Be("page");
//        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
//    }

//    [Fact]
//    public void LoadMenu_WhenDisplayNameIsNull_SetsUserNameFromName() {
//        // Arrange
//        _testUser.DisplayName = null;
//        this.Configure(opt => opt.CurrentUser = _testUser);
//        var expectedCurrentUser = new CurrentUser {
//            IsAuthenticated = true,
//            Id = _testUser.Id,
//            IsAdministrator = false,
//            DisplayName = _testUser.Name,
//        };

//        // Act
//        var component = RenderComponent<NavMenuComponent>();

//        // Assert
//        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
//    }

//    [Fact]
//    public void LoadMenu_WhenUserIsNull_SetsEmptyUserName() {
//        // Arrange
//        this.Configure();
//        var expectedCurrentUser = new CurrentUser {
//            IsAuthenticated = false,
//            Id = Guid.Empty,
//            IsAdministrator = false,
//            DisplayName = string.Empty,
//        };

//        // Act
//        var component = RenderComponent<NavMenuComponent>();

//        // Assert
//        component.Instance.CurrentUser.Should().BeEquivalentTo(expectedCurrentUser);
//    }

//    [Fact]
//    public void Dispose_UnregistersLocationChangedEvent() {
//        // Arrange
//        this.Configure();
//        var component = RenderComponent<NavMenuComponent>();

//        // Act
//        var action = component.Instance.Dispose;

//        // Assert
//        action.Should().NotThrow();
//    }
//}