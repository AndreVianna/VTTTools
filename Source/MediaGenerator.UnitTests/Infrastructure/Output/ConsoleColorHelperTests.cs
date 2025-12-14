namespace VttTools.MediaGenerator.Infrastructure.Output;

public class ConsoleColorHelperTests {
    [Theory]
    [InlineData(ConsoleColor.Green, "\x1b[32m")]
    [InlineData(ConsoleColor.Yellow, "\x1b[33m")]
    [InlineData(ConsoleColor.Red, "\x1b[31m")]
    [InlineData(ConsoleColor.Gray, "\x1b[90m")]
    [InlineData(ConsoleColor.Cyan, "\x1b[36m")]
    public void Colorize_WithSupportedColor_ReturnsColorizedText(ConsoleColor color, string expectedAnsi) {
        const string text = "Test message";

        var result = ConsoleColorHelper.Colorize(text, color);

        if (!Console.IsOutputRedirected) {
            result.Should().Contain(expectedAnsi);
            result.Should().Contain(text);
            result.Should().EndWith("\x1b[0m");
        }
        else {
            result.Should().Be(text);
        }
    }

    [Fact]
    public void Colorize_WithUnsupportedColor_ReturnsResetCode() {
        const string text = "Test message";

        var result = ConsoleColorHelper.Colorize(text, ConsoleColor.Magenta);

        if (!Console.IsOutputRedirected) {
            result.Should().Contain("\x1b[0m");
            result.Should().Contain(text);
        }
        else {
            result.Should().Be(text);
        }
    }

    [Theory]
    [InlineData(HealthCheckStatus.Pass, "✓")]
    [InlineData(HealthCheckStatus.Warning, "⚠")]
    [InlineData(HealthCheckStatus.Fail, "✗")]
    [InlineData(HealthCheckStatus.Skipped, "-")]
    public void GetStatusIcon_WithKnownStatus_ReturnsCorrectIcon(HealthCheckStatus status, string expectedIcon) {
        var result = ConsoleColorHelper.GetStatusIcon(status);

        result.Should().Be(expectedIcon);
    }

    [Fact]
    public void GetStatusIcon_WithUnknownStatus_ReturnsQuestionMark() {
        const HealthCheckStatus status = (HealthCheckStatus)999;

        var result = ConsoleColorHelper.GetStatusIcon(status);

        result.Should().Be("?");
    }

    [Theory]
    [InlineData(HealthCheckStatus.Pass, ConsoleColor.Green)]
    [InlineData(HealthCheckStatus.Warning, ConsoleColor.Yellow)]
    [InlineData(HealthCheckStatus.Fail, ConsoleColor.Red)]
    [InlineData(HealthCheckStatus.Skipped, ConsoleColor.Gray)]
    public void GetStatusColor_WithKnownStatus_ReturnsCorrectColor(HealthCheckStatus status, ConsoleColor expectedColor) {
        var result = ConsoleColorHelper.GetStatusColor(status);

        result.Should().Be(expectedColor);
    }

    [Fact]
    public void GetStatusColor_WithUnknownStatus_ReturnsGray() {
        const HealthCheckStatus status = (HealthCheckStatus)999;

        var result = ConsoleColorHelper.GetStatusColor(status);

        result.Should().Be(ConsoleColor.Gray);
    }
}
