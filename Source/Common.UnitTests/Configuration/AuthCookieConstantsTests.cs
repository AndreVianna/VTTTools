namespace VttTools.Configuration;

public class AuthCookieConstantsTests {
    #region Cookie Name Tests

    [Fact]
    public void AdminCookieName_HasCorrectValue()
        => Assert.Equal("vtttools_admin_auth", AuthCookieConstants.AdminCookieName);

    [Fact]
    public void ClientCookieName_HasCorrectValue()
        => Assert.Equal("vtttools_client_auth", AuthCookieConstants.ClientCookieName);

    [Fact]
    public void CookieNames_AreDifferent()
        => Assert.NotEqual(AuthCookieConstants.AdminCookieName, AuthCookieConstants.ClientCookieName);

    #endregion

    #region CreateSecureCookie Tests - Development Mode

    [Fact]
    public void CreateSecureCookie_Development_HttpOnlyIsTrue() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.True(options.HttpOnly);
    }

    [Fact]
    public void CreateSecureCookie_Development_SecureIsFalse() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.False(options.Secure);
    }

    [Fact]
    public void CreateSecureCookie_Development_SameSiteIsLax() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.Equal(SameSiteMode.Lax, options.SameSite);
    }

    [Fact]
    public void CreateSecureCookie_Development_PathIsRoot() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.Equal("/", options.Path);
    }

    [Fact]
    public void CreateSecureCookie_Development_MaxAgeIsSevenDays() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.Equal(TimeSpan.FromDays(7), options.MaxAge);
    }

    #endregion

    #region CreateSecureCookie Tests - Production Mode

    [Fact]
    public void CreateSecureCookie_Production_HttpOnlyIsTrue() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        Assert.True(options.HttpOnly);
    }

    [Fact]
    public void CreateSecureCookie_Production_SecureIsTrue() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        Assert.True(options.Secure);
    }

    [Fact]
    public void CreateSecureCookie_Production_SameSiteIsStrict() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        Assert.Equal(SameSiteMode.Strict, options.SameSite);
    }

    [Fact]
    public void CreateSecureCookie_Production_PathIsRoot() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        Assert.Equal("/", options.Path);
    }

    [Fact]
    public void CreateSecureCookie_Production_MaxAgeIsSevenDays() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: false);

        Assert.Equal(TimeSpan.FromDays(7), options.MaxAge);
    }

    #endregion

    #region CreateExpiredCookie Tests

    [Fact]
    public void CreateExpiredCookie_Development_MaxAgeIsZero() {
        var options = AuthCookieConstants.CreateExpiredCookie(isDevelopment: true);

        Assert.Equal(TimeSpan.Zero, options.MaxAge);
    }

    [Fact]
    public void CreateExpiredCookie_Production_MaxAgeIsZero() {
        var options = AuthCookieConstants.CreateExpiredCookie(isDevelopment: false);

        Assert.Equal(TimeSpan.Zero, options.MaxAge);
    }

    [Fact]
    public void CreateExpiredCookie_Development_SameSiteMatchesSecureCookie() {
        var expiredOptions = AuthCookieConstants.CreateExpiredCookie(isDevelopment: true);
        var secureOptions = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.Equal(secureOptions.SameSite, expiredOptions.SameSite);
    }

    [Fact]
    public void CreateExpiredCookie_Production_SameSiteIsStrict() {
        var options = AuthCookieConstants.CreateExpiredCookie(isDevelopment: false);

        Assert.Equal(SameSiteMode.Strict, options.SameSite);
    }

    #endregion

    #region Security Regression Tests

    [Fact]
    public void CreateSecureCookie_Development_NotStrictSameSite() {
        var options = AuthCookieConstants.CreateSecureCookie(isDevelopment: true);

        Assert.NotEqual(SameSiteMode.Strict, options.SameSite);
    }

    [Fact]
    public void CreateSecureCookie_DefaultParameter_IsProduction() {
        var options = AuthCookieConstants.CreateSecureCookie();

        Assert.True(options.Secure);
        Assert.Equal(SameSiteMode.Strict, options.SameSite);
    }

    #endregion
}