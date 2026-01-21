namespace VttTools.Auth.Services;

public sealed class ConsoleEmailServiceTests
    : IDisposable {
    private readonly ConsoleEmailService _sut;
    private readonly StringWriter _consoleOutput;
    private bool _disposedValue;

    public ConsoleEmailServiceTests() {
        _sut = new ConsoleEmailService();
        _consoleOutput = new StringWriter();
        Console.SetOut(_consoleOutput);
    }

    public void Dispose() {
        if (_disposedValue)
            return;
        _consoleOutput.Dispose();
        GC.SuppressFinalize(this);
        _disposedValue = true;
    }

    #region SendPasswordResetEmailAsync Tests

    [Fact]
    public async Task SendPasswordResetEmailAsync_WithValidEmail_WritesToConsole() {
        const string toEmail = "user@example.com";
        const string resetLink = "https://example.com/reset?token=abc123";

        await _sut.SendPasswordResetEmailAsync(toEmail, resetLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain("[EMAIL] Password Reset Email");
        output.Should().Contain($"[EMAIL] To: {toEmail}");
        output.Should().Contain($"[EMAIL] Reset Link: {resetLink}");
        output.Should().Contain("[EMAIL] This link expires in 24 hours");
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_WithDifferentEmail_WritesCorrectEmail() {
        const string toEmail = "another@example.com";
        const string resetLink = "https://example.com/reset?token=xyz789";

        await _sut.SendPasswordResetEmailAsync(toEmail, resetLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain($"[EMAIL] To: {toEmail}");
        output.Should().NotContain("user@example.com");
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_WithLongResetLink_WritesFullLink() {
        const string toEmail = "test@example.com";
        const string resetLink = "https://example.com/reset-password?token=verylongtokenstring1234567890abcdefghijklmnopqrstuvwxyz";

        await _sut.SendPasswordResetEmailAsync(toEmail, resetLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain(resetLink);
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_CompletesSuccessfully() {
        const string toEmail = "test@example.com";
        const string resetLink = "https://example.com/reset?token=abc123";

        Func<Task> act = () => _sut.SendPasswordResetEmailAsync(toEmail, resetLink);

        await act.Should().NotThrowAsync();
    }

    #endregion

    #region SendEmailConfirmationAsync Tests

    [Fact]
    public async Task SendEmailConfirmationAsync_WithValidEmail_WritesToConsole() {
        const string toEmail = "newuser@example.com";
        const string confirmationLink = "https://example.com/confirm?token=def456";

        await _sut.SendEmailConfirmationAsync(toEmail, confirmationLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain("[EMAIL] Email Confirmation");
        output.Should().Contain($"[EMAIL] To: {toEmail}");
        output.Should().Contain($"[EMAIL] Confirmation Link: {confirmationLink}");
        output.Should().Contain("[EMAIL] Please click the link to confirm your email address");
    }

    [Fact]
    public async Task SendEmailConfirmationAsync_WithDifferentEmail_WritesCorrectEmail() {
        const string toEmail = "confirmed@example.com";
        const string confirmationLink = "https://example.com/confirm?token=ghi789";

        await _sut.SendEmailConfirmationAsync(toEmail, confirmationLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain($"[EMAIL] To: {toEmail}");
        output.Should().NotContain("newuser@example.com");
    }

    [Fact]
    public async Task SendEmailConfirmationAsync_WithLongConfirmationLink_WritesFullLink() {
        const string toEmail = "test@example.com";
        const string confirmationLink = "https://example.com/confirm-email?token=verylongtokenstring1234567890abcdefghijklmnopqrstuvwxyz";

        await _sut.SendEmailConfirmationAsync(toEmail, confirmationLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain(confirmationLink);
    }

    [Fact]
    public async Task SendEmailConfirmationAsync_CompletesSuccessfully() {
        const string toEmail = "test@example.com";
        const string confirmationLink = "https://example.com/confirm?token=def456";

        Func<Task> act = () => _sut.SendEmailConfirmationAsync(toEmail, confirmationLink);

        await act.Should().NotThrowAsync();
    }

    #endregion

    #region Integration Tests

    [Fact]
    public async Task SendPasswordResetEmailAsync_ThenSendEmailConfirmationAsync_BothWriteToConsole() {
        const string resetEmail = "reset@example.com";
        const string resetLink = "https://example.com/reset?token=abc123";
        const string confirmEmail = "confirm@example.com";
        const string confirmLink = "https://example.com/confirm?token=def456";

        await _sut.SendPasswordResetEmailAsync(resetEmail, resetLink);
        await _sut.SendEmailConfirmationAsync(confirmEmail, confirmLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain("[EMAIL] Password Reset Email");
        output.Should().Contain(resetEmail);
        output.Should().Contain(resetLink);
        output.Should().Contain("[EMAIL] Email Confirmation");
        output.Should().Contain(confirmEmail);
        output.Should().Contain(confirmLink);
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_WithSpecialCharactersInEmail_HandlesCorrectly() {
        const string toEmail = "user+test@example.co.uk";
        const string resetLink = "https://example.com/reset?token=abc123";

        await _sut.SendPasswordResetEmailAsync(toEmail, resetLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain($"[EMAIL] To: {toEmail}");
    }

    [Fact]
    public async Task SendEmailConfirmationAsync_WithSpecialCharactersInEmail_HandlesCorrectly() {
        const string toEmail = "user.name+tag@sub.example.com";
        const string confirmationLink = "https://example.com/confirm?token=def456";

        await _sut.SendEmailConfirmationAsync(toEmail, confirmationLink);

        var output = _consoleOutput.ToString();
        output.Should().Contain($"[EMAIL] To: {toEmail}");
    }

    #endregion
}