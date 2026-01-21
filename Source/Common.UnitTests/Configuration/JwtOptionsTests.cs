namespace VttTools.Configuration;

public class JwtOptionsTests {
    #region SecretKey Validation Tests

    [Fact]
    public void SecretKey_ValidKey_SetsValue() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        };

        Assert.Equal("valid-secret-key-with-minimum-32-characters-required", options.SecretKey);
    }

    [Fact]
    public void SecretKey_Exactly32Characters_SetsValue() {
        var options = new JwtOptions {
            SecretKey = "12345678901234567890123456789012",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        };

        Assert.Equal("12345678901234567890123456789012", options.SecretKey);
        Assert.Equal(32, options.SecretKey.Length);
    }

    [Fact]
    public void SecretKey_LessThan32Characters_ThrowsArgumentException() {
        var exception = Assert.Throws<ArgumentException>(() => new JwtOptions {
            SecretKey = "short-key",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        });

        Assert.Contains("must be at least 32 characters long", exception.Message);
        Assert.Equal("SecretKey", exception.ParamName);
    }

    [Fact]
    public void SecretKey_Exactly31Characters_ThrowsArgumentException() {
        var exception = Assert.Throws<ArgumentException>(() => new JwtOptions {
            SecretKey = "1234567890123456789012345678901",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        });

        Assert.Contains("must be at least 32 characters long", exception.Message);
    }

    [Fact]
    public void SecretKey_EmptyString_ThrowsArgumentException() {
        var exception = Assert.Throws<ArgumentException>(() => new JwtOptions {
            SecretKey = "",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        });

        Assert.Contains("cannot be empty", exception.Message);
        Assert.Equal("SecretKey", exception.ParamName);
    }

    [Fact]
    public void SecretKey_WhitespaceOnly_ThrowsArgumentException() {
        var exception = Assert.Throws<ArgumentException>(() => new JwtOptions {
            SecretKey = "   ",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        });

        Assert.Contains("cannot be empty", exception.Message);
        Assert.Equal("SecretKey", exception.ParamName);
    }

    [Fact]
    public void SecretKey_Null_ThrowsArgumentException() {
        var exception = Assert.Throws<ArgumentException>(() => new JwtOptions {
            SecretKey = null!,
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        });

        Assert.Contains("cannot be empty", exception.Message);
        Assert.Equal("SecretKey", exception.ParamName);
    }

    #endregion

    #region ValidateForProduction Tests

    [Fact]
    public void ValidateForProduction_ValidProductionKey_DoesNotThrow() {
        var options = new JwtOptions {
            SecretKey = "production-secure-random-key-min-32-chars-x1y2z3a4b5c6",
            Issuer = "VttTools.Auth",
            Audience = "VttTools.Services",
        };

        var exception = Record.Exception(options.ValidateForProduction);

        Assert.Null(exception);
    }

    [Fact]
    public void ValidateForProduction_KeyContainsDevelopment_ThrowsInvalidOperationException() {
        var options = new JwtOptions {
            SecretKey = "development-secret-key-min-32-characters-long-change-in-production-vtttools",
            Issuer = "VttTools.Auth",
            Audience = "VttTools.Services",
        };

        var exception = Assert.Throws<InvalidOperationException>(options.ValidateForProduction);

        Assert.Contains("CRITICAL SECURITY ERROR", exception.Message);
        Assert.Contains("Open development JWT SecretKey detected", exception.Message);
    }

    [Fact]
    public void ValidateForProduction_KeyContainsDevelopmentUppercase_ThrowsInvalidOperationException() {
        var options = new JwtOptions {
            SecretKey = "DEVELOPMENT-secret-key-min-32-characters-long-change-in-production",
            Issuer = "VttTools.Auth",
            Audience = "VttTools.Services",
        };

        var exception = Assert.Throws<InvalidOperationException>(options.ValidateForProduction);

        Assert.Contains("CRITICAL SECURITY ERROR", exception.Message);
    }

    [Fact]
    public void ValidateForProduction_KeyContainsChangeThis_ThrowsInvalidOperationException() {
        var options = new JwtOptions {
            SecretKey = "please-change-this-secret-key-to-something-secure-minimum-32-chars",
            Issuer = "VttTools.Auth",
            Audience = "VttTools.Services",
        };

        var exception = Assert.Throws<InvalidOperationException>(options.ValidateForProduction);

        Assert.Contains("CRITICAL SECURITY ERROR", exception.Message);
    }

    [Fact]
    public void ValidateForProduction_KeyContainsChangeInProduction_ThrowsInvalidOperationException() {
        var options = new JwtOptions {
            SecretKey = "temporary-key-change-in-production-min-32-characters-required-here",
            Issuer = "VttTools.Auth",
            Audience = "VttTools.Services",
        };

        var exception = Assert.Throws<InvalidOperationException>(options.ValidateForProduction);

        Assert.Contains("CRITICAL SECURITY ERROR", exception.Message);
    }

    [Fact]
    public void ValidateForProduction_KeyContainsChangeInProductionMixedCase_ThrowsInvalidOperationException() {
        var options = new JwtOptions {
            SecretKey = "temporary-key-ChAnGe-In-PrOdUcTiOn-min-32-characters-required",
            Issuer = "VttTools.Auth",
            Audience = "VttTools.Services",
        };

        var exception = Assert.Throws<InvalidOperationException>(options.ValidateForProduction);

        Assert.Contains("CRITICAL SECURITY ERROR", exception.Message);
    }

    #endregion

    #region Default Values Tests

    [Fact]
    public void ExpirationMinutes_DefaultValue_Is60() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        };

        Assert.Equal(60, options.ExpirationMinutes);
    }

    [Fact]
    public void RememberMeExpirationMinutes_DefaultValue_Is43200() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
        };

        Assert.Equal(43200, options.RememberMeExpirationMinutes);
    }

    [Fact]
    public void ExpirationMinutes_CustomValue_SetsCorrectly() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            ExpirationMinutes = 15,
        };

        Assert.Equal(15, options.ExpirationMinutes);
    }

    [Fact]
    public void RememberMeExpirationMinutes_CustomValue_SetsCorrectly() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            RememberMeExpirationMinutes = 1440,
        };

        Assert.Equal(1440, options.RememberMeExpirationMinutes);
    }

    #endregion

    #region Required Properties Tests

    [Fact]
    public void Issuer_SetValue_ReturnsCorrectValue() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "VttTools.Auth",
            Audience = "TestAudience",
        };

        Assert.Equal("VttTools.Auth", options.Issuer);
    }

    [Fact]
    public void Audience_SetValue_ReturnsCorrectValue() {
        var options = new JwtOptions {
            SecretKey = "valid-secret-key-with-minimum-32-characters-required",
            Issuer = "TestIssuer",
            Audience = "VttTools.Services",
        };

        Assert.Equal("VttTools.Services", options.Audience);
    }

    #endregion
}