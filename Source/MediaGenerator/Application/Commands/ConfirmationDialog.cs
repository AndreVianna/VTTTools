namespace VttTools.MediaGenerator.Application.Commands;

public static class ConfirmationDialog {
    public static bool Show(IReadOnlyList<Asset> entries) {
        var totalVariants = entries.Sum(e => e.Tokens.Count);
        ConsoleOutput.WriteLine("=".PadRight(60, '='));
        ConsoleOutput.WriteLine($"Total entities: {entries.Count}");
        ConsoleOutput.WriteLine($"Total variants: {totalVariants}");

        if (totalVariants > 50) {
            ConsoleOutput.WriteBlankLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            ConsoleOutput.WriteLine($"⚠ Warning: Generating {totalVariants} variants will create many API calls.");
            ConsoleOutput.WriteLine("  Consider using --limit parameter when generating.");
            Console.ResetColor();
        }

        ConsoleOutput.WriteBlankLine();
        Console.ForegroundColor = ConsoleColor.Green;
        ConsoleOutput.WriteLine("✓ All entities valid and ready for generation.");
        Console.ResetColor();

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.Write("Can I proceed? ([Y]es/No): ");
        var response = Console.ReadLine()?.Trim().ToLowerInvariant();
        return response is "Y" or "yes" or "" or null;
    }
}