namespace VttTools.WebApp.Components;

public class NavMenuComponentTests : WebAppTestContext {
    [Fact]
    public void WithAuthenticatedUser_ShowsUserMenu() {
        // Arrange
        UseDefaultUser();

        // Act
        var cut = RenderComponent<NavMenuComponent>();

        // Assert
        var displayName = cut.Instance.CurrentUser.DisplayName;
        var tagId = ((IHtmlDivElement)cut.Nodes[0]).Attributes[1]!.Name;
        cut.Markup.Should().Contain($"""<span class="bi bi-house-door-fill-nav-menu" aria-hidden="true" {tagId}></span> Home""");
        cut.Markup.Should().Contain($"""<span class="bi bi-arrow-bar-left-nav-menu" aria-hidden="true" {tagId}></span> Logout""");
        cut.Markup.Should().Contain($"""<span class="bi bi-person-fill-nav-menu" aria-hidden="true" {tagId}></span> {displayName}""");
        cut.Markup.Should().Contain($"""<span class="bi bi-people-fill" aria-hidden="true" {tagId}></span> Meetings""");
        cut.Markup.Should().Contain($"""<span class="bi bi-book-fill" aria-hidden="true" {tagId}></span> Adventures""");
        cut.Markup.Should().Contain($"""<span class="bi bi-collection-fill" aria-hidden="true" {tagId}></span> Assets""");
    }

    [Fact]
    public void WithNotAuthenticatedUser_ShowsGuestMenu() {
        // Act
        var cut = RenderComponent<NavMenuComponent>();

        // Assert
        var tagId = ((IHtmlDivElement)cut.Nodes[0]).Attributes[1]!.Name;
        cut.Markup.Should().Contain($"""<span class="bi bi-house-door-fill-nav-menu" aria-hidden="true" {tagId}></span> Home""");
        cut.Markup.Should().Contain($"""<span class="bi bi-person-nav-menu" aria-hidden="true" {tagId}></span> Register""");
        cut.Markup.Should().Contain($"""<span class="bi bi-person-badge-nav-menu" aria-hidden="true" {tagId}></span> Login""");
    }

    [Fact]
    public void OnLocationChanged_UpdatesCurrentUrl() {
        // Arrange
        var navigationManager = Services.GetRequiredService<NavigationManager>();
        var cut = RenderComponent<NavMenuComponent>();
        cut.WaitForState(() => cut.Instance.IsReady, TimeSpan.FromMilliseconds(500));

        // Act
        navigationManager.NavigateTo("/new_location");

        // Assert
        cut.Instance.CurrentLocation.Should().Be("new_location");
    }
}