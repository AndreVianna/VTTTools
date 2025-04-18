namespace VttTools.Helpers;

public class StringHelpersTests {
    [Theory]
    [InlineData("user@example.com", true, true)]
    [InlineData("user.name@example.com", true, true)]
    [InlineData("user-name@example.com", true, true)]
    [InlineData("user+tag@example.com", true, true)]
    [InlineData("user.name+tag@example-site.co.uk", true, true)]
    [InlineData("", true, true)]
    [InlineData("", false, false)]
    [InlineData("   ", true, false)]
    [InlineData("invalid", true, false)]
    [InlineData("invalid@", true, false)]
    [InlineData("@example.com", true, false)]
    [InlineData("user@example", true, false)]
    [InlineData("user@.com", true, false)]
    [InlineData("user@example..com", true, false)]
    public void IsValidEmail_WithVariousInputs_ValidatesCorrectly(string email, bool allowEmpty, bool expectedResult) {
        // Arrange - Done with the [InlineData]

        // Act
        var result = email.IsValidEmail(allowEmpty);

        // Assert
        result.Should().Be(expectedResult);
    }
}