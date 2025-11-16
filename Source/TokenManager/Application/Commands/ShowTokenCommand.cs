namespace VttTools.TokenManager.Application.Commands;

public sealed class ShowTokenCommand(FileTokenStore store) {
    private readonly FileTokenStore _store = store;

    public void Execute(ShowTokenCommandOptions options) {
        var meta = _store.LoadMetadata(options.IdOrName);
        if (meta is null) {
            Console.WriteLine($"No metadata found for entity '{options.IdOrName}'.");
            return;
        }

        Console.WriteLine($"ID:        {meta.EntityId}");
        Console.WriteLine($"Name:      {meta.EntityName}");
        Console.WriteLine($"Type:      {meta.EntityType}");
        Console.WriteLine($"File:      {meta.FileName}");
        Console.WriteLine($"Created:   {meta.CreatedAtUtc:u}");
        Console.WriteLine($"Engine:    {meta.EngineId}");
        Console.WriteLine("Prompt:");
        Console.WriteLine(meta.Prompt);
    }
}
