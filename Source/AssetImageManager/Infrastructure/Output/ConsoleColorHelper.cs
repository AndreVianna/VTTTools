namespace VttTools.AssetImageManager.Infrastructure.Output;

public static class ConsoleColorHelper {
    private static readonly bool _supportsColor = !Console.IsOutputRedirected;

    public static string Colorize(string text, ConsoleColor color) {
        if (!_supportsColor) {
            return text;
        }

        var ansiCode = color switch {
            ConsoleColor.Green => "\x1b[32m",
            ConsoleColor.Yellow => "\x1b[33m",
            ConsoleColor.Red => "\x1b[31m",
            ConsoleColor.Gray => "\x1b[90m",
            ConsoleColor.Cyan => "\x1b[36m",
            _ => "\x1b[0m"
        };

        return $"{ansiCode}{text}\x1b[0m";
    }

    public static string GetStatusIcon(HealthCheckStatus status) => status switch {
        HealthCheckStatus.Pass => "✓",
        HealthCheckStatus.Warning => "⚠",
        HealthCheckStatus.Fail => "✗",
        HealthCheckStatus.Skipped => "-",
        _ => "?"
    };

    public static ConsoleColor GetStatusColor(HealthCheckStatus status) => status switch {
        HealthCheckStatus.Pass => ConsoleColor.Green,
        HealthCheckStatus.Warning => ConsoleColor.Yellow,
        HealthCheckStatus.Fail => ConsoleColor.Red,
        HealthCheckStatus.Skipped => ConsoleColor.Gray,
        _ => ConsoleColor.Gray
    };
}
