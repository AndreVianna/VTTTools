var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddUserSecrets(typeof(Program).Assembly, optional: true)
    .Build();

var apiKey = config["Stability:ApiKey"];
if (string.IsNullOrWhiteSpace(apiKey)) {
    Console.WriteLine("ERROR: Stability API Key is not configured.");
    Console.WriteLine("Configure it using user secrets:");
    Console.WriteLine("  dotnet user-secrets set \"Stability:ApiKey\" \"KEY\"");
    return 1;
}

var engineId = config["Stability:EngineId"] ?? "stable-diffusion-xl-1024-v1-0";
var outputDir = new DirectoryInfo(config["TokenManager:OutputRoot"] ?? "tokens");
Directory.CreateDirectory(outputDir.FullName);

var delay = int.TryParse(config["TokenManager:DelayInMs"], out var d) ? d : 500;
var limit = int.TryParse(config["TokenManager:MaxTokens"], out var mt) ? mt : 0;

var rootCommand = new RootCommand("TokenManager - generate and manage VTT tokens");

var monstersOption = new Option<FileInfo>("--import", "-i") {
    Description = "Path to monsters.json",
    Required = true,
};

var idOrNameOption = new Option<string?>("--idOrName") {
    Description = "Optional monster idOrName or name to generate only one (also used for regenerate)"
};

var variantsOption = new Option<int>("--variants") {
    Description = "Number of variants per monster",
    DefaultValueFactory = (_) => 1
};

var limitOption = new Option<int?>("--limit") {
    Description = "Optional max number of monsters to process"
};

var generateCommand = new Command("generate", "Generate tokens for monsters from JSON")
{
    monstersOption,
    idOrNameOption,
    variantsOption,
    limitOption
};

generateCommand.SetAction(parseResult => {
    var idOrName = parseResult.GetValue(idOrNameOption);
    var monstersFile = parseResult.GetValue(monstersOption);
    var variants = parseResult.GetValue(variantsOption);

    if (string.IsNullOrWhiteSpace(apiKey)) {
        Console.Error.WriteLine("Api Key is required.");
        return 1;
    }

    if (monstersFile is null) {
        Console.Error.WriteLine("Monsters file is required.");
        return 1;
    }

    if (!monstersFile.Exists) {
        Console.Error.WriteLine($"Monsters file not found: {monstersFile.FullName}");
        return 1;
    }

    Console.WriteLine("Generating...");
    Console.WriteLine($"  engine     : {engineId}");
    Console.WriteLine($"  idOrName         : {idOrName ?? "<all>"}");
    Console.WriteLine($"  monsters   : {monstersFile.FullName}");
    Console.WriteLine($"  output     : {outputDir.FullName}");
    Console.WriteLine($"  variants   : {variants}");
    Console.WriteLine($"  delay (ms) : {delay}");
    Console.WriteLine($"  limit      : {(limit == 0 ? "<none>" : limit.ToString())}");

    using var http = new HttpClient { BaseAddress = new Uri("https://api.stability.ai") };
    var stability = new StabilityClient(http, apiKey, engineId);
    var store = new FileTokenStore(outputDir.FullName);
    var service = new TokenGenerationService(stability, store);

    var cmd = new GenerateTokensCommand(service, engineId);

    var options = new GenerateTokensCommandOptions(
        InputPath: monstersFile.FullName,
        Limit: limit,
        DelayMs: delay,
        Variants: variants,
        IdOrNameFilter: idOrName
    );

    cmd.ExecuteAsync(options).GetAwaiter().GetResult();

    return 0;
});

var filterKindOption = new Option<string?>(name: "--kind") {
    Description = "Filter by kind: monster, npc, object, character",
};

var listCommand = new Command("list", "List tokens")
{
    idOrNameOption,
    filterKindOption,
};

listCommand.SetAction(parseResult => {
    var idOrName = parseResult.GetValue(idOrNameOption);
    var typeFilter = Enum.TryParse<EntityType>(parseResult.GetValue(filterKindOption), out var tf) ? tf : (EntityType?)null;

    Console.WriteLine("Listing tokens...");
    Console.WriteLine($"  idOrName or name: {idOrName ?? "<any>"}");
    Console.WriteLine($"  kind filter: {(typeFilter.HasValue ? typeFilter.Value.ToString() : "<any>")}");

    var store = new FileTokenStore(outputDir.FullName);

    var cmd = new ListTokensCommand(store);

    var options = new ListTokensCommandOptions(typeFilter, idOrName);

    cmd.Execute(options);

    return 0;
});

var showCommand = new Command("show", "Show a token details by idOrName")
{
    idOrNameOption,
};

showCommand.SetAction(parseResult => {
    var idOrName = parseResult.GetValue(idOrNameOption);
    if (string.IsNullOrWhiteSpace(idOrName)) {
        Console.Error.WriteLine("Error: --idOrName is required for 'token show'.");
        return 1;
    }

    Console.WriteLine("[TokenManager] Showing token info...");
    Console.WriteLine($"  idOrName or name: {idOrName ?? "<any>"}");

    var store = new FileTokenStore(outputDir.FullName);

    var cmd = new ShowTokenCommand(store);

    var options = new ShowTokenCommandOptions(idOrName!);

    // This is the key part you were asking about:
    // ExecuteAsync is actually invoked here.
    cmd.Execute(options);

    return 0;
});

rootCommand.Subcommands.Add(generateCommand);
rootCommand.Subcommands.Add(listCommand);
rootCommand.Subcommands.Add(showCommand);

return rootCommand.Parse(args).Invoke();
