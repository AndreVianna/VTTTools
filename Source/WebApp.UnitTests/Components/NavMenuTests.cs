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
        var tagId = ((IHtmlDivElement)cut.Nodes[0]).Attributes[1]!.Name;
        cut.Markup.Should().Contain($"""<span class="md-symbol logout filled me-1" aria-hidden="true" {tagId}></span> Logout""");
        cut.Markup.Should().Contain($"""<span class="md-symbol profile filled me-1" aria-hidden="true" {tagId}></span> {displayName}""");
        cut.Markup.Should().Contain($"""<span class="md-symbol schedule me-1" aria-hidden="true" {tagId}></span> Events""");
        cut.Markup.Should().Contain($"""<span class="md-symbol library filled me-1" aria-hidden="true" {tagId}></span> Library""");
        cut.Markup.Should().Contain($"""<span class="md-symbol assets me-1" aria-hidden="true" {tagId}></span> Assets""");
    }

    [Fact]
    public void WithNotAuthenticatedUser_ShowsGuestMenu() {
        // Act
        var cut = RenderComponent<NavMenu>();

        // Assert
        var tagId = ((IHtmlDivElement)cut.Nodes[0]).Attributes[1]!.Name;
        cut.Markup.Should().Contain($"""<span class="md-symbol register filled me-1" aria-hidden="true" {tagId}></span> Register""");
        cut.Markup.Should().Contain($"""<span class="md-symbol login filled me-1" aria-hidden="true" {tagId}></span> Login""");
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