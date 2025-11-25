namespace VttTools.AssetImageManager.Application.Commands;

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
        ConsoleOutput.WriteLine($"Category: {entityInfo.Classification.Category}");
        ConsoleOutput.WriteLine($"Type: {entityInfo.Classification.Type}");
        ConsoleOutput.WriteLine($"Subtype: {entityInfo.Classification.Subtype}");
        ConsoleOutput.WriteBlankLine();
        ConsoleOutput.WriteLine($"Total Tokens: {entityInfo.Tokens.Count}");
        ConsoleOutput.WriteBlankLine();

        for (var i = 0; i < entityInfo.Tokens.Count; i++)
            ConsoleOutput.WriteLine($"Token {i + 1}: {entityInfo.Tokens[i].Description}");
    }
}
