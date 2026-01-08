namespace VttTools.Configuration;

/// <summary>
/// Unit tests for AuthCookieConstants to ensure cookie configuration
/// is correct and prevents authentication race conditions.
/// </summary>
public class AuthCookieConstantsTests {
    #region Cookie Name Tests

    [Fact]
    public void AdminCookieName_HasCorrectValue() {
        // Assert
        Assert.Equal("vtttools_admin_auth", AuthCookieConstants.AdminCookieName);
    }

    [Fact]
    public void ClientCookieName_HasCorrectValue() {
        // Assert
        Assert.Equal("vtttools_client_auth", AuthCookieConstants.ClientCookieName);
    }

    [Fact]
    public void CookieNames_AreDifferent() {
        // Ensure admin and client cookies are distinct to prevent conflicts
        Assert.NotEqual(AuthCookieConstants.AdminCookieName, AuthCookieConstants.ClientCookieName);
    }

    #endregion

    #region CreateSecureCookie Tests - Development Mode

    [Fact]
    public void CreateSecureCookie_Development_HttpOnlyIsTrue() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        // Assert - HttpOnly must always be true to prevent XSS
        Assert.True(options.HttpOnly);
    }

    [Fact]
    public void CreateSecureCookie_Development_SecureIsFalse() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        // Assert - In development, Secure=false allows HTTP
        Assert.False(options.Secure);
    }

    [Fact]
    public void CreateSecureCookie_Development_SameSiteIsLax() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        // Assert - CRITICAL: SameSite=Lax in development for Vite proxy compatibility.
        // SameSite=Strict caused cookies not to be sent through the Vite proxy,
        // resulting in 401 errors on subsequent requests after login.
        Assert.Equal(SameSiteMode.Lax, options.SameSite);
    }

    [Fact]
    public void CreateSecureCookie_Development_PathIsRoot() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        // Assert - Path must be "/" for cookies to be sent on all routes
        Assert.Equal("/", options.Path);
    }

    [Fact]
    public void CreateSecureCookie_Development_MaxAgeIsSevenDays() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        // Assert
        Assert.Equal(TimeSpan.FromDays(7), options.MaxAge);
    }

    #endregion

    #region CreateSecureCookie Tests - Production Mode

    [Fact]
    public void CreateSecureCookie_Production_HttpOnlyIsTrue() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        // Assert - HttpOnly must always be true to prevent XSS
        Assert.True(options.HttpOnly);
    }

    [Fact]
    public void CreateSecureCookie_Production_SecureIsTrue() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        // Assert - In production, Secure=true requires HTTPS
        Assert.True(options.Secure);
    }

    [Fact]
    public void CreateSecureCookie_Production_SameSiteIsStrict() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        // Assert - In production, SameSite=Strict for maximum security
        Assert.Equal(SameSiteMode.Strict, options.SameSite);
    }

    [Fact]
    public void CreateSecureCookie_Production_PathIsRoot() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        // Assert - Path must be "/" for cookies to be sent on all routes
        Assert.Equal("/", options.Path);
    }

    [Fact]
    public void CreateSecureCookie_Production_MaxAgeIsSevenDays() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        // Assert
        Assert.Equal(TimeSpan.FromDays(7), options.MaxAge);
    }

    #endregion

    #region CreateExpiredCookie Tests

    [Fact]
    public void CreateExpiredCookie_Development_MaxAgeIsZero() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateExpiredCookie(isDevelopment: true);

        // Assert - MaxAge=0 causes immediate cookie deletion
        Assert.Equal(TimeSpan.Zero, options.MaxAge);
    }

    [Fact]
    public void CreateExpiredCookie_Production_MaxAgeIsZero() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateExpiredCookie(isDevelopment: false);

        // Assert - MaxAge=0 causes immediate cookie deletion
        Assert.Equal(TimeSpan.Zero, options.MaxAge);
    }

    [Fact]
    public void CreateExpiredCookie_Development_SameSiteMatchesSecureCookie() {
        // Arrange & Act
        var expiredOptions = AuthCookieConstants.CreateExpiredCookie(isDevelopment: true);
        var secureOptions = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        // Assert - SameSite must match for cookie deletion to work
        Assert.Equal(secureOptions.SameSite, expiredOptions.SameSite);
    }

    [Fact]
    public void CreateExpiredCookie_Production_SameSiteIsStrict() {
        // Arrange & Act
        var options = AuthCookieConstants.CreateExpiredCookie(isDevelopment: false);

        // Assert
        Assert.Equal(SameSiteMode.Strict, options.SameSite);
    }

    #endregion

    #region Security Regression Tests

    [Fact]
    public void CreateSecureCookie_Development_NotStrictSameSite() {
        // CRITICAL REGRESSION TEST: This test prevents reintroduction of the bug
        // where SameSite=Strict in development caused cookies not to be sent
        // through the Vite proxy, resulting in immediate 401 after login.
        //
        // The fix was to use SameSite=Lax in development mode.
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.NotEqual(SameSiteMode.Strict, options.SameSite);
    }

    [Fact]
    public void CreateSecureCookie_DefaultParameter_IsProduction() {
        // Arrange & Act - calling without parameter defaults to production (false)
        var options = AuthCookieConstants.CreateSecureCookie();

        // Assert - Default should be production settings (most secure)
        Assert.True(options.Secure);
        Assert.Equal(SameSiteMode.Strict, options.SameSite);
    }

    #endregion
}
