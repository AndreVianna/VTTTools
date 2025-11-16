namespace VttTools.TokenManager.Application.Commands;

public sealed class ListTokensCommand(IFileTokenStore store) {
    private readonly IFileTokenStore _store = store;

    public void Execute(ListTokensCommandOptions options) {
        foreach (var (_, meta) in _store.EnumerateTokens()) {
            if (options.TypeFilter is not null &&
                !string.Equals(meta.EntityType, options.TypeFilter.ToString(), StringComparison.OrdinalIgnoreCase)) {
                continue;
            }

            if (options.IdOrName is not null &&
                !string.Equals(meta.EntityId, options.IdOrName, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(meta.EntityName, options.IdOrName, StringComparison.OrdinalIgnoreCase)) {
                continue;
            }

            Console.WriteLine($"{meta.EntityType,-16} {meta.EntityId,-24} {meta.EntityName}  -> {meta.FileName}");
        }
    }
}
