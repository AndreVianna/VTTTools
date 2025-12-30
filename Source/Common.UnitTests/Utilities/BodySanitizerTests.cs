namespace VttTools.Utilities;

public class BodySanitizerTests {
    [Fact]
    public void SanitizeRequestBody_WithPasswordField_RedactsPassword() {
        const string body = "{\"username\":\"john\",\"password\":\"secret123\"}";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"password\":\"***REDACTED***\"");
        result.Should().Contain("\"username\":\"john\"");
    }

    [Fact]
    public void SanitizeRequestBody_WithPasswordField_CaseInsensitive() {
        var testCases = new[] {
            "{\"Password\":\"secret\"}",
            "{\"PASSWORD\":\"secret\"}",
            "{\"PaSsWoRd\":\"secret\"}",
                              };

        foreach (var body in testCases) {
            var result = BodySanitizer.SanitizeRequestBody(body);

            result.Should().NotBeNull();
            result.Should().Contain("***REDACTED***");
        }
    }

    [Fact]
    public void SanitizeRequestBody_WithTokenFields_RedactsAllTokens() {
        const string body = "{\"token\":\"abc123\",\"accessToken\":\"xyz789\",\"bearerToken\":\"def456\",\"apiKey\":\"key123\"}";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"token\":\"***REDACTED***\"");
        result.Should().Contain("\"accessToken\":\"***REDACTED***\"");
        result.Should().Contain("\"bearerToken\":\"***REDACTED***\"");
        result.Should().Contain("\"apiKey\":\"***REDACTED***\"");
    }

    [Fact]
    public void SanitizeRequestBody_WithNestedObjects_SanitizesRecursively() {
        const string body = "{\"user\":{\"name\":\"john\",\"password\":\"secret\"},\"token\":\"abc123\"}";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"password\":\"***REDACTED***\"");
        result.Should().Contain("\"token\":\"***REDACTED***\"");
        result.Should().Contain("\"name\":\"john\"");
    }

    [Fact]
    public void SanitizeRequestBody_WithArrayOfObjects_SanitizesEachElement() {
        const string body = "[{\"username\":\"john\",\"password\":\"secret1\"},{\"username\":\"jane\",\"password\":\"secret2\"}]";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"password\":\"***REDACTED***\"");
        result.Should().Contain("\"username\":\"john\"");
        result.Should().Contain("\"username\":\"jane\"");
    }

    [Fact]
    public void SanitizeRequestBody_WithNonJsonContent_ReturnsOriginalContent() {
        const string body = "This is not JSON content";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().Be(body);
    }

    [Fact]
    public void SanitizeRequestBody_WithLongContent_TruncatesTo8000Characters() {
        var longJson = "{\"data\":\"" + new string('a', 9000) + "\"}";

        var result = BodySanitizer.SanitizeRequestBody(longJson);

        result.Should().NotBeNull();
        (result.Length > 8000).Should().BeTrue();
        (result.Length < 8100).Should().BeTrue();
        result.Should().EndWith("... [truncated]");
    }

    [Fact]
    public void SanitizeRequestBody_WithMalformedJson_HandlesGracefully() {
        const string malformedJson = "{\"username\":\"john\",\"password\":";

        var result = BodySanitizer.SanitizeRequestBody(malformedJson);

        result.Should().Be(malformedJson);
    }

    [Fact]
    public void SanitizeRequestBody_WithNullInput_ReturnsNull() {
        var result = BodySanitizer.SanitizeRequestBody(null);

        result.Should().BeNull();
    }

    [Fact]
    public void SanitizeRequestBody_WithEmptyInput_ReturnsNull() {
        var result = BodySanitizer.SanitizeRequestBody("");

        result.Should().BeNull();
    }

    [Fact]
    public void SanitizeRequestBody_PreservesNonSensitiveData() {
        const string body = "{\"username\":\"john\",\"email\":\"john@example.com\",\"age\":30}";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"username\":\"john\"");
        result.Should().Contain("\"email\":\"john@example.com\"");
        result.Should().Contain("\"age\":\"30\"");
    }

    [Fact]
    public void SanitizeRequestBody_WithMultipleSensitiveFields_RedactsAll() {
        const string body = "{\"username\":\"john\",\"password\":\"secret\",\"token\":\"abc\",\"apiKey\":\"key\",\"secret\":\"shhh\"}";

        var result = BodySanitizer.SanitizeRequestBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"password\":\"***REDACTED***\"");
        result.Should().Contain("\"token\":\"***REDACTED***\"");
        result.Should().Contain("\"apiKey\":\"***REDACTED***\"");
        result.Should().Contain("\"secret\":\"***REDACTED***\"");
        result.Should().Contain("\"username\":\"john\"");
    }

    [Fact]
    public void SanitizeResponseBody_WithPasswordField_RedactsPassword() {
        const string body = "{\"username\":\"john\",\"password\":\"secret123\"}";

        var result = BodySanitizer.SanitizeResponseBody(body);

        result.Should().NotBeNull();
        result.Should().Contain("\"password\":\"***REDACTED***\"");
    }

    [Fact]
    public void SanitizeResponseBody_WithNullInput_ReturnsNull() {
        var result = BodySanitizer.SanitizeResponseBody(null);

        result.Should().BeNull();
    }

    [Fact]
    public void SanitizeQueryString_WithSensitiveParameters_RedactsThem() {
        const string queryString = "?token=abc123&user=john&apiKey=secret";

        var result = BodySanitizer.SanitizeQueryString(queryString);

        result.Should().NotBeNull();
        result.Should().Contain("token=***REDACTED***");
        result.Should().Contain("apiKey=***REDACTED***");
        result.Should().Contain("user=john");
    }

    [Fact]
    public void SanitizeQueryString_WithoutLeadingQuestionMark_HandlesCorrectly() {
        const string queryString = "password=secret&user=john";

        var result = BodySanitizer.SanitizeQueryString(queryString);

        result.Should().NotBeNull();
        result.Should().Contain("password=***REDACTED***");
        result.Should().Contain("user=john");
    }

    [Fact]
    public void SanitizeQueryString_WithNullInput_ReturnsNull() {
        var result = BodySanitizer.SanitizeQueryString(null);

        result.Should().BeNull();
    }

    [Fact]
    public void SanitizeQueryString_WithEmptyInput_ReturnsEmptyString() {
        var result = BodySanitizer.SanitizeQueryString("");

        result.Should().BeEmpty();
    }

    [Fact]
    public void SanitizeQueryString_WithLongQueryString_Truncates() {
        var longValue = new string('a', 9000);
        var queryString = $"data={longValue}";

        var result = BodySanitizer.SanitizeQueryString(queryString);

        result.Should().NotBeNull();
        (result.Length > 8000).Should().BeTrue();
        (result.Length < 8100).Should().BeTrue();
        result.Should().EndWith("... [truncated]");
    }

    [Fact]
    public void SanitizeQueryString_WithParameterWithoutValue_PreservesIt() {
        const string queryString = "?flag&user=john";

        var result = BodySanitizer.SanitizeQueryString(queryString);

        result.Should().NotBeNull();
        result.Should().Contain("flag");
        result.Should().Contain("user=john");
    }

    [Fact]
    public void SanitizeQueryString_CaseInsensitive_RedactsPasswordVariants() {
        const string queryString = "?Password=secret&TOKEN=abc&ApiKey=xyz";

        var result = BodySanitizer.SanitizeQueryString(queryString);

        result.Should().NotBeNull();
        result.Should().Contain("Password=***REDACTED***");
        result.Should().Contain("TOKEN=***REDACTED***");
        result.Should().Contain("ApiKey=***REDACTED***");
    }
}