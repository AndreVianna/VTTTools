namespace VttTools.AssetImageManager.Application.Commands;

public static class AllowOverwriteDialog {
    public static AllowOverwriteResult ShowFor(string filePath) {
        var askAgain = true;
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"The file {filePath} already exist.");
        while (askAgain) {
            ConsoleOutput.Write("Overwrite? (All/Yes/[N]o/Skip/Cancel): ");
            var response = Console.ReadLine()?.Trim().ToLowerInvariant();
            switch (response) {
                case "a" or "all":
                    return AllowOverwriteResult.AlwaysOverwrite;
                case "y" or "yes":
                    return AllowOverwriteResult.Overwrite;
                case "n" or "no" or "" or null:
                    ConsoleOutput.WriteLine("Skipping file.");
                    return AllowOverwriteResult.Skip;
                case "s" or "skipThis":
                    ConsoleOutput.WriteLine("Skipping: file");
                    return AllowOverwriteResult.AlwaysSkip;
                case "c" or "cancel":
                    ConsoleOutput.WriteLine("Cancelled by the user.");
                    return AllowOverwriteResult.Cancel;
                default:
                    ConsoleOutput.WriteLine($"Option {response} is not supported.");
                    askAgain = true;
                    break;
            }
        }

        ConsoleOutput.WriteLine("You should not be here. Cancelling preparantion.");
        return AllowOverwriteResult.Cancel;
    }
}