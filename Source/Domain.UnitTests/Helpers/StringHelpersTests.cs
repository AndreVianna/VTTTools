namespace VttTools.Helpers;

public class StringHelpersTests {
    [Theory]
    [InlineData("user@example.com", true, true)]
    [InlineData("user.name@example.com", true, true)]
    [InlineData("user-name@example.com", true, true)]
    [InlineData("user+tag@example.com", true, true)]
    [InlineData("user.name+tag@example-site.co.uk", true, true)]
    [InlineData("User.Name+Tag@Example-Site.Co.Uk", true, true)] // Test case insensitivity
    [InlineData("123@example.com", true, true)] // Numeric start
    [InlineData("user@example.technology", true, true)] // Long TLD
    [InlineData("a@b.co", true, true)] // Minimal valid email
    [InlineData("very.common@example.com", true, true)]
    [InlineData("disposable.style.email.with+symbol@example.com", true, true)]
    [InlineData("other.email-with-hyphen@example.com", true, true)]
    [InlineData("fully-qualified-domain@example.com", true, true)]
    // The regex doesn't support multiple + symbols
    [InlineData("user.name+tag+sorting@example.com", true, false)] // Multiple + symbols
    [InlineData("x@example.com", true, true)] // One-letter local part
    [InlineData("", true, false)]
    [InlineData("", false, false)]
    [InlineData("   ", true, false)]
    [InlineData("invalid", true, false)]
    [InlineData("invalid@", true, false)]
    [InlineData("@example.com", true, false)]
    [InlineData("user@example", true, false)]
    [InlineData("user@.com", true, false)]
    [InlineData("user@example..com", true, false)]
    [InlineData("Abc.example.com", true, false)] // No @ character
    [InlineData("A@b@c@example.com", true, false)] // Multiple @ characters
    [InlineData("a\"b(c)d,e:f;g<h>i[j\\k]l@example.com", true, false)] // Special characters in local part
    [InlineData("just\"not\"right@example.com", true, false)] // Quoted strings
    [InlineData("this is\"not\\allowed@example.com", true, false)] // Spaces and special characters
    [InlineData("i.like.underscores@but_they_are_not_allowed_in_this_part.example.com", true, false)] // Underscore in domain part
    [InlineData("QA[icon]CHOCOLATE[icon]@test.com", true, false)] // Special characters
    public void IsValidEmail_WithVariousInputs_ValidatesCorrectly(string email, bool allowEmpty, bool expectedResult) {
        // Arrange - Done with the [InlineData]

        // Act
        var result = email.IsValidEmail(allowEmpty);

        // Assert
        result.Should().Be(expectedResult);
    }

    // Test cases specifically covering different branches in IsValidEmail
    [Fact]
    public void IsValidEmail_WhenEmailIsEmpty_AndAllowEmptyIsTrue_ReturnsFalse() {
        // Act
        var result = string.Empty.IsValidEmail(true);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsValidEmail_WhenEmailIsEmpty_AndAllowEmptyIsFalse_ReturnsFalse() {
        // Act
        var result = string.Empty.IsValidEmail(false);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsValidEmail_WhenEmailIsWhitespace_AndAllowEmptyIsTrue_ReturnsFalse() {
        // Act
        var result = "   ".IsValidEmail(true);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsValidEmail_WhenEmailIsWhitespace_AndAllowEmptyIsFalse_ReturnsFalse() {
        // Act
        var result = "   ".IsValidEmail(false);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsValidEmail_NullHandling_ThrowsArgumentNullException() {
        // Arrange
        const string? email = null;

        // Act & Assert
        Action act = () => email!.IsValidEmail(true);
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void IsValidEmail_EmptyString_ReturnsFalse() {
        // Act
        var result = string.Empty.IsValidEmail(true);

        // Assert
        result.Should().BeFalse();
    }

    // Edge cases for email format
    [Theory]
    [InlineData("user@example-site.co.uk")] // Hyphen in domain
    [InlineData("user@sub.example.com")] // Subdomain
    [InlineData("user.name@example.com")] // Dot in local part
    [InlineData("user-name@example.com")] // Hyphen in local part
    [InlineData("user+tag@example.com")] // Plus in local part
    [InlineData("123456@example.com")] // All digits in local part
    [InlineData("user@123.example.com")] // Digits in domain
    [InlineData("USER@EXAMPLE.COM")] // All uppercase
    public void IsValidEmail_WithValidFormats_ReturnsTrue(string email) {
        // Act
        var result = email.IsValidEmail(true);

        // Assert
        result.Should().BeTrue();
    }

    // Testing the regex's handling of various domain parts
    [Theory]
    [InlineData("user@example.a")] // Single-character TLD (should fail)
    [InlineData("user@example.abcdefghijklmnopqrst")] // Very long TLD (valid)
    [InlineData("user@a.co")] // Single-character domain (valid)
    [InlineData("user@123.456.789.co")] // Multiple numeric subdomains (valid)
    [InlineData("user@sub-domain.example.com")] // Hyphen in subdomain (valid)
    public void IsValidEmail_WithVariousDomainFormats_ValidatesCorrectly(string email) {
        // Act
        var result = email.IsValidEmail(true);

        // Assert
        // The validation should pass for all these except the first one
        if (email == "user@example.a") {
            result.Should().BeFalse();
        }
        else {
            result.Should().BeTrue();
        }
    }
}