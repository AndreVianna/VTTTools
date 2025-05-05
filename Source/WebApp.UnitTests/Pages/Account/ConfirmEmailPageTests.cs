namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageTests
    : WebAppTestContext {
    [Fact]
    public void WhenRequested_WithNoParameters_RedirectsToHome() {
        // Act
        var cut = RenderComponent<ConfirmEmailPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;

        // Assert
        navigationSpy.History.Should().ContainSingle(x => x.Uri == string.Empty);
    }

    [Fact]
    public void WhenRequested_WithValidParameters_ConfirmsEmail() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());
        var parameters = new Dictionary<string, object?> {
            [nameof(ConfirmEmailPage.UserId)] = userId,
            [nameof(ConfirmEmailPage.Code)] = code,
        };

        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };
        UserManager.FindByIdAsync(userId).Returns(user);
        UserManager.ConfirmEmailAsync(user, "SomeValidationCode").Returns(IdentityResult.Success);

        var navigationManager = (FakeNavigationManager)Services.GetRequiredService<NavigationManager>();
        var uri = navigationManager.GetUriWithQueryParameters("/account/confirm_email", parameters);

        // Act
        navigationManager.NavigateTo(uri);

        // Assert
        var cut = RenderComponent<ConfirmEmailPage>();
        cut.Markup.Should().Contain("Thank you for confirming your email.");
        UserManager.Received(1).ConfirmEmailAsync(user, "SomeValidationCode");
    }

    [Fact]
    public void WhenRequested_WithInvalidUser_RedirectsHomeWithStatus() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("SomeValidationCode"u8.ToArray());
        var parameters = new Dictionary<string, object?> {
            [nameof(ConfirmEmailPage.UserId)] = userId,
            [nameof(ConfirmEmailPage.Code)] = code,
        };

        UserManager.FindByIdAsync(userId).Returns((User?)null);

        var navigationManager = (FakeNavigationManager)Services.GetRequiredService<NavigationManager>();
        var uri = navigationManager.GetUriWithQueryParameters("/account/confirm_email", parameters);

        // Act
        navigationManager.NavigateTo(uri);

        // Assert
        var cut = RenderComponent<ConfirmEmailPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        navigationSpy.History.Should().ContainSingle(x => x.Uri == string.Empty);
    }

    [Fact]
    public void WhenRequested_WithInvalidCode_RedirectsHomeWithStatus() {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var code = WebEncoders.Base64UrlEncode("InvalidCode"u8.ToArray());
        var parameters = new Dictionary<string, object?> {
            [nameof(ConfirmEmailPage.UserId)] = userId,
            [nameof(ConfirmEmailPage.Code)] = code,
        };

        var user = new User { Id = Guid.Parse(userId), Email = "test@example.com" };
        UserManager.FindByIdAsync(userId).Returns(user);
        UserManager.ConfirmEmailAsync(user, "InvalidCode").Returns(IdentityResult.Failed());

        var navigationManager = (FakeNavigationManager)Services.GetRequiredService<NavigationManager>();
        var uri = navigationManager.GetUriWithQueryParameters("/account/confirm_email", parameters);

        // Act
        navigationManager.NavigateTo(uri);

        // Assert
        var cut = RenderComponent<ConfirmEmailPage>();
        var navigationSpy = cut.Instance.NavigationManager.Should().BeOfType<FakeNavigationManager>().Subject;
        navigationSpy.History.Should().ContainSingle(x => x.Uri == string.Empty);
    }
}