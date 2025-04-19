namespace VttTools.Helpers;

public class StringHelpersTests {
    private sealed class EmailTestData
        : IEnumerable<TheoryDataRow<string, bool, bool>> {
        public IEnumerator<TheoryDataRow<string, bool, bool>> GetEnumerator() {
            yield return new("", true, false);
            yield return new("", false, false);
            yield return new("   ", true, false);
            yield return new("user@example.com", true, true);
            yield return new("user.name@example.com", true, true);
            yield return new("user-name@example.com", true, true);
            yield return new("user+tag@example.com", true, true);
            yield return new("user.name+tag@example-site.co.uk", true, true);
            yield return new("User.Subject+Tag@Example-Site.Co.Uk", true, true);
            yield return new("123@example.com", true, true);
            yield return new("user@example.technology", true, true);
            yield return new("a@b.co", true, true);
            yield return new("very.common@example.com", true, true);
            yield return new("disposable.style.email.with+symbol@example.com", true, true);
            yield return new("other.email-with-hyphen@example.com", true, true);
            yield return new("fully-qualified-domain@example.com", true, true);
            yield return new("user.name+tag+sorting@example.com", true, false);
            yield return new("x@example.com", true, true);
            yield return new("invalid", true, false);
            yield return new("invalid@", true, false);
            yield return new("@example.com", true, false);
            yield return new("user@example", true, false);
            yield return new("user@.com", true, false);
            yield return new("user@example..com", true, false);
            yield return new("Abc.example.com", true, false);
            yield return new("A@b@c@example.com", true, false);
            yield return new("a\"b(c)d,e:f;g<h>i[j\\k]l@example.com", true, false);
            yield return new("just\"not\"right@example.com", true, false);
            yield return new("this is\"not\\allowed@example.com", true, false);
            yield return new("i.like.underscores@but_they_are_not_allowed_in_this_part.example.com", true, false);
            yield return new("QA[icon]CHOCOLATE[icon]@test.com", true, false);
            yield return new("user@example-site.co.uk", true, true);
            yield return new("user@sub.example.com", true, true);
            yield return new("user.name@example.com", true, true);
            yield return new("user-name@example.com", true, true);
            yield return new("user+tag@example.com", true, true);
            yield return new("123456@example.com", true, true);
            yield return new("user@123.example.com", true, true);
            yield return new("USER@EXAMPLE.COM", true, true);
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
    [Theory]
    [ClassData(typeof(EmailTestData))]
    public void IsValidEmail_WithVariousInputs_ValidatesCorrectly(string email, bool allowEmpty, bool expectedResult) {
        // Arrange - Done with the [InlineData]

        // Act
        var result = email.IsValidEmail(allowEmpty);

        // Assert
        result.Should().Be(expectedResult);
    }
}