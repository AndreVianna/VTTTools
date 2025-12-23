namespace VttTools.MediaGenerator.Application.Commands;

public sealed class ShowCommand(IFileStore store) {
    private readonly IFileStore _store = store;

    public void Execute(ShowTokenOptions options) {
        var assets = _store.GetAssets();

        var matchingSummary = assets.FirstOrDefault(s =>
            string.Equals(s.Name, options.Name, StringComparison.OrdinalIgnoreCase));

        if (matchingSummary is null) {
            ConsoleOutput.WriteLine($"No entity found with name '{options.Name}'.");
            return;
        }

        var entityInfo = _store.FindAsset(matchingSummary.Name);

        if (entityInfo is null) {
            ConsoleOutput.WriteLine($"Error: Could not load details for entity '{options.Name}'.");
            return;
        }

        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Entity: {entityInfo.Name}");
        ConsoleOutput.WriteLine($"Kind: {entityInfo.Classification.Kind}");
        ConsoleOutput.WriteLine($"GeneratedContentType: {entityInfo.Classification.Category}");
        ConsoleOutput.WriteLine($"ResourceType: {entityInfo.Classification.Type}");
        ConsoleOutput.WriteLine($"Subtype: {entityInfo.Classification.Subtype}");
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Total Tokens: {entityInfo.Tokens.Count}");
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Description: {entityInfo.Description}");
    }
}