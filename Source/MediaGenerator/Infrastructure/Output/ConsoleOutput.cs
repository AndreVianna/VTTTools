namespace VttTools.MediaGenerator.Infrastructure.Output;

public static class ConsoleOutput {
    public static void WriteSuccess(string message) {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine(message);
        Console.ResetColor();
    }

    public static void WriteWarning(string message) {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine(message);
        Console.ResetColor();
    }

    public static void WriteError(string message) {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine(message);
        Console.ResetColor();
    }

    public static void WriteProgress(int current, int total, string message)
        => System.Console.WriteLine($"[{current}/{total}] {message}");

    public static void WriteCost(int inputTokens, double inputCost, int outputTokens, double outputCost, int totalTokens, double totalCost)
        => System.Console.Write($" Cost: ${inputCost:0.0000000} ({inputTokens}) + " +
                                $"${outputCost:0.0000000} ({outputTokens}) = " +
                                $"${totalCost:0.0000000} ({totalTokens});");

    public static void WriteElapsed(TimeSpan? duration, bool success) {
        Console.ForegroundColor = success ? ConsoleColor.Green : ConsoleColor.Red;
        var status = success ? "✓ Success" : "✗ Failed";
        Console.WriteLine($" Elapsed: {duration:mm\\:ss\\.fff} {status}");
        Console.ResetColor();
    }

    public static void WriteSummary(string label, object value)
        => System.Console.WriteLine($"{label}: {value}");

    public static void WriteBlankLine()
        => System.Console.WriteLine();

    public static void Write(string message)
        => System.Console.Write(message);

    public static void WriteLine(string message)
        => System.Console.WriteLine(message);
}