var serviceCollection = new ServiceCollection();
serviceCollection.AddHttpClient();
var serviceProvider = serviceCollection.BuildServiceProvider();

var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddUserSecrets(typeof(Program).Assembly, optional: true)
    .Build();

var outputDir = new DirectoryInfo(config["OutputRootFolder"] ?? "tokens");
Directory.CreateDirectory(outputDir.FullName);

var delay = int.TryParse(config["DelayBetweenRequestsInMs"], out var d) ? d : 500;
var limit = int.TryParse(config["MaximumRequestsPerFile"], out var mt) ? mt : 0;
var outputImageSize = int.TryParse(config["OutputImageSize"], out var ois) ? ois : 0;
var outputAspectRatio = config["OutputAspectRatio"] ?? "1:1";

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

    if (monstersFile is null) {
        Console.Error.WriteLine("Monsters file is required.");
        return 1;
    }

    if (!monstersFile.Exists) {
        Console.Error.WriteLine($"Monsters file not found: {monstersFile.FullName}");
        return 1;
    }

    var provider = config["Provider"] ?? "Stability";
    var engine = config[$"{provider}:Engine"] ?? "SD35";

    Console.WriteLine("Generating...");
    Console.WriteLine($"  idOrName         : {idOrName ?? "<all>"}");
    Console.WriteLine($"  monsters   : {monstersFile.FullName}");
    Console.WriteLine($"  output     : {outputDir.FullName}");
    Console.WriteLine($"  variants   : {variants}");
    Console.WriteLine($"  delay (ms) : {delay}");
    Console.WriteLine($"  limit      : {(limit == 0 ? "<none>" : limit.ToString())}");
    Console.WriteLine($"  provider   : {provider}");
    Console.WriteLine($"  engine     : {engine}");
    Console.WriteLine($"  aspect ratio : {outputAspectRatio}");
    Console.WriteLine($"  image size : {(outputImageSize > 0 ? $"{outputImageSize}x{outputImageSize}" : "original")}");

    var serviceProvider = serviceCollection.BuildServiceProvider();
    var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();

    IStabilityClient stability = engine.ToUpperInvariant() switch {
        "SD35" => new StableDiffusion35Client(httpClientFactory, config),
        "CORE" => new StableImageCoreClient(httpClientFactory, config),
        _ => throw new InvalidOperationException($"Unknown engine: {engine}. Valid values: SD35, Core")
    };

    var store = new FileTokenStore(outputDir.FullName);
    var service = new TokenGenerationService(stability, store, outputImageSize, outputAspectRatio);

    var cmd = new GenerateTokensCommand(service);

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
