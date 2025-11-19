using static VttTools.AssetImageManager.Application.Commands.CommandFactory;

var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .AddUserSecrets(typeof(Program).Assembly, optional: true)
    .Build();

var serviceCollection = new ServiceCollection();
serviceCollection.AddSingleton<IConfiguration>(config);
serviceCollection.AddHttpClient();
serviceCollection.AddSingleton<IPromptEnhancer, OpenAiClient>();

var outputDir = new DirectoryInfo(config["OutputFolder"] ?? "Output");
Directory.CreateDirectory(outputDir.FullName);

var delay = int.TryParse(config["DelayBetweenRequestsInMs"], out var d) ? d : 500;
var limit = int.TryParse(config["MaxEntriesPerFile"], out var mt) ? mt : 0;
var outputAspectRatio = config["OutputAspectRatio"] ?? "1:1";

var rootCommand = new RootCommand("AssetImageManager v2.0 - Generate VTT tokens with cartesian variants, themes, and AI-enhanced prompts");

var inputFileOption = new Option<FileInfo>("--import", "-i") {
    Description = "Path to entities.json file with entity definitions and variant specifications",
    Required = true,
};

var idOrNameOption = new Option<string?>("--idOrName") {
    Description = "Filter to generate tokens for a single entity by name"
};

var idOption = new Option<string?>("--id") {
    Description = "Entity identifier or name to show details for"
};

var variantsOption = new Option<int>("--variants") {
    Description = "Number of pose variants to generate per structural variant",
    DefaultValueFactory = (_) => 1
};

var limitOption = new Option<int?>("--limit") {
    Description = "Maximum number of entities to process from the input file"
};

var filterKindOption = new Option<string?>(name: "--kind") {
    Description = "Filter by kind: monster, npc, object, character",
};

using var serviceProvider = serviceCollection.BuildServiceProvider();
var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();

var prepareCommand = CreatePrepareCommand(config, serviceCollection, outputDir, inputFileOption, limitOption);
var generateCommand = CreateGenerateCommand(config, serviceCollection, outputDir, delay, limit, inputFileOption, idOrNameOption, variantsOption, limitOption);
var listCommand = CreateListCommand(outputDir, idOrNameOption, filterKindOption);
var showCommand = CreateShowCommand(outputDir, idOption);
var doctorCommand = CreateDoctorCommand(config, httpClientFactory, outputDir);

rootCommand.Subcommands.Add(prepareCommand);
rootCommand.Subcommands.Add(generateCommand);
rootCommand.Subcommands.Add(listCommand);
rootCommand.Subcommands.Add(showCommand);
rootCommand.Subcommands.Add(doctorCommand);

return await rootCommand.Parse(args).InvokeAsync();
