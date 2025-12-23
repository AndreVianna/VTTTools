
namespace VttTools.Auth;

/// <summary>
/// Unit tests for Auth request validation logic in isolation.
/// Tests validation attributes and business rules without external dependencies.
/// </summary>
public class AuthValidationTests {

    #region LoginRequest Validation Tests

    [Theory]
    [InlineData("", "ValidPassword123!", false, "Email is required")]
    [InlineData("invalid-email", "ValidPassword123!", false, "Invalid email format")]
    [InlineData("@example.com", "ValidPassword123!", false, "Invalid email format")]
    [InlineData("test@", "ValidPassword123!", false, "Invalid email format")]
    public void LoginRequest_InvalidEmail_FailsValidation(string email, string password, bool rememberMe, string expectedError) {
        // Arrange
        var request = new LoginRequest {
            Email = email,
            Password = password,
            RememberMe = rememberMe
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains(expectedError.Split(' ')[0])); // Check for key part of error
    }

    [Theory]
    [InlineData("test@example.com", "", false, "Password is required")]
    public void LoginRequest_InvalidPassword_FailsValidation(string email, string password, bool rememberMe, string expectedError) {
        // Arrange
        var request = new LoginRequest {
            Email = email,
            Password = password,
            RememberMe = rememberMe
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains(expectedError.Split(' ')[0]));
    }

    [Theory]
    [InlineData("test@example.com", "ValidPassword123!", true)]
    [InlineData("test@example.com", "ValidPassword123!", false)]
    [InlineData("user.name+tag@example.co.uk", "AnotherPassword456!", true)]
    [InlineData("test.email@domain.com", "Password@123", false)]
    public void LoginRequest_ValidData_PassesValidation(string email, string password, bool rememberMe) {
        // Arrange
        var request = new LoginRequest {
            Email = email,
            Password = password,
            RememberMe = rememberMe
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Empty(validationResults);
    }

    #endregion

    #region RegisterRequest Validation Tests

    [Theory]
    [InlineData("", "Password123!", "Password123!", "Test User", "TestUser", "Email is required")]
    [InlineData("invalid-email", "Password123!", "Password123!", "Test User", "TestUser", "Invalid email format")]
    public void RegisterRequest_InvalidEmail_FailsValidation(string email, string password, string confirmPassword,
        string name, string displayName, string expectedError) {
        // Arrange
        var request = new RegisterRequest {
            Email = email,
            Password = password,
            ConfirmPassword = confirmPassword,
            Name = name,
            DisplayName = displayName
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains(expectedError.Split(' ')[0]));
    }

    [Theory]
    [InlineData("test@example.com", "", "", "Test User", "TestUser", "Password is required")]
    [InlineData("test@example.com", "12345", "12345", "Test User", "TestUser", "Password must be between 6 and 100 characters")]
    [InlineData("test@example.com", "Password123!", "DifferentPassword", "Test User", "TestUser", "Password and confirm password do not match")]
    public void RegisterRequest_InvalidPassword_FailsValidation(string email, string password, string confirmPassword,
        string name, string displayName, string expectedError) {
        // Arrange
        var request = new RegisterRequest {
            Email = email,
            Password = password,
            ConfirmPassword = confirmPassword,
            Name = name,
            DisplayName = displayName
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains(expectedError.Split(' ')[2])); // Check for key part
    }

    [Theory]
    [InlineData("test@example.com", "Password123!", "Password123!", "", "TestUser", "Name is required")]
    public void RegisterRequest_InvalidName_FailsValidation(string email, string password, string confirmPassword,
        string name, string displayName, string expectedError) {
        // Arrange
        var request = new RegisterRequest {
            Email = email,
            Password = password,
            ConfirmPassword = confirmPassword,
            Name = name,
            DisplayName = displayName
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains(expectedError.Split(' ')[0]));
    }

    [Fact]
    public void RegisterRequest_InvalidDisplayName_FailsValidation() {
        // Arrange
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Test User",
            DisplayName = new string('D', 33) // Exceeds 32 character limit
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains("Token name"));
    }

    [Theory]
    [InlineData("test@example.com", "Password123!", "Password123!", "Test User", "TestUser")]
    [InlineData("user.name@domain.com", "StrongPassword456!", "StrongPassword456!", "John Doe", "JohnD")]
    [InlineData("test@example.co.uk", "MyPassword789@", "MyPassword789@", "Test User", null)] // Null DisplayName
    [InlineData("test@example.com", "ValidPass123#", "ValidPass123#", "A", "A")] // Minimum length name
    public void RegisterRequest_ValidData_PassesValidation(string email, string password, string confirmPassword,
        string name, string? displayName) {
        // Arrange
        var request = new RegisterRequest {
            Email = email,
            Password = password,
            ConfirmPassword = confirmPassword,
            Name = name,
            DisplayName = displayName
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Empty(validationResults);
    }

    [Fact]
    public void RegisterRequest_MinimumValidPassword_PassesValidation() {
        // Arrange
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = "123456", // Minimum 6 characters
            ConfirmPassword = "123456",
            Name = "Test User",
            DisplayName = "TestUser"
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Empty(validationResults);
    }

    [Fact]
    public void RegisterRequest_MaximumValidPassword_PassesValidation() {
        // Arrange
        var maxPassword = new string('P', 100); // Maximum 100 characters
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = maxPassword,
            ConfirmPassword = maxPassword,
            Name = "Test User",
            DisplayName = "TestUser"
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Empty(validationResults);
    }

    [Fact]
    public void RegisterRequest_MaximumNameLength_PassesValidation() {
        // Arrange
        var maxName = new string('N', 128); // Maximum 128 characters
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = maxName,
            DisplayName = "TestUser"
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Empty(validationResults);
    }

    [Fact]
    public void RegisterRequest_NameTooLong_FailsValidation() {
        // Arrange
        var tooLongName = new string('N', 129); // Exceeds 128 characters
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = tooLongName,
            DisplayName = "TestUser"
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Contains(validationResults, v => v.ErrorMessage!.Contains("Name must be"));
    }

    [Fact]
    public void RegisterRequest_MaximumDisplayNameLength_PassesValidation() {
        // Arrange
        var maxDisplayName = new string('D', 32); // Maximum 32 characters
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Name = "Test User",
            DisplayName = maxDisplayName
        };

        // Act & Assert
        var validationResults = ValidateRequest(request);
        Assert.Empty(validationResults);
    }

    #endregion

    #region Validation Helper Method Tests

    [Theory]
    [InlineData("test@example.com", true)]
    [InlineData("user.name+tag@example.co.uk", true)]
    [InlineData("test123@domain-name.com", true)]
    [InlineData("test@example", true)] // Actually valid per .NET validation
    [InlineData("invalid-email", false)]
    [InlineData("@example.com", false)]
    [InlineData("test@", false)]
    [InlineData("", false)]
    public void EmailValidation_VariousFormats_ValidatesCorrectly(string email, bool expectedValid) {
        // Arrange
        var request = new LoginRequest {
            Email = email,
            Password = "ValidPassword123!",
            RememberMe = false
        };

        // Act
        var validationResults = ValidateRequest(request);
        var emailErrors = validationResults.Where(v => v.MemberNames.Contains("Email"));

        // Assert
        if (expectedValid) {
            Assert.Empty(emailErrors);
        }
        else {
            Assert.NotEmpty(emailErrors);
        }
    }

    [Theory]
    [InlineData("Password123!", "Password123!", true)]
    [InlineData("Password123!", "DifferentPassword", false)]
    [InlineData("", "", false)] // Both empty - password required error
    [InlineData("Pass123", "Pass123", true)] // Valid minimum length
    public void PasswordConfirmValidation_VariousCombinations_ValidatesCorrectly(string password, string confirmPassword, bool expectedValid) {
        // Arrange
        var request = new RegisterRequest {
            Email = "test@example.com",
            Password = password,
            ConfirmPassword = confirmPassword,
            Name = "Test User",
            DisplayName = "TestUser"
        };

        // Act
        var validationResults = ValidateRequest(request);
        var passwordErrors = validationResults.Where(v =>
            v.MemberNames.Contains("Password") || v.MemberNames.Contains("ConfirmPassword"));

        // Assert
        if (expectedValid) {
            // Should not have password mismatch errors (may have required field errors if empty)
            Assert.DoesNotContain(passwordErrors, e => e.ErrorMessage!.Contains("do not match"));
        }
        else {
            Assert.NotEmpty(passwordErrors);
        }
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Validates a request object using data annotations validation.
    /// </summary>
    /// <param name="request">The request object to validate</param>
    /// <returns>Collection of validation results</returns>
    private static List<ValidationResult> ValidateRequest(object request) {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request, null, null);

        Validator.TryValidateObject(request, validationContext, validationResults, true);

        return validationResults;
    }

    #endregion
}