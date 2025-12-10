namespace VttTools.MediaGenerator.Application.Commands;

internal static class CommandFactory {
    public static Command CreatePrepareCommand(
        IConfiguration config,
        ServiceCollection serviceCollection,
        DirectoryInfo outputDir,
        Option<FileInfo> inputFileOption,
        Option<int?> limitOption) {
        var showAllOption = new Option<bool>("--show-all", "-a") {
            Description = "Show all variants even when count exceeds 10"
        };

        var prepareCommand = new Command("prepare", "Validate entity definitions, preview variants, and generate prompt files")
        {
            inputFileOption,
            showAllOption,
            limitOption
        };

        prepareCommand.SetAction(async parseResult => {
            var inputFile = parseResult.GetValue(inputFileOption);
            var showAll = parseResult.GetValue(showAllOption);
            var limit = parseResult.GetValue(limitOption);

            if (inputFile is null) {
                ConsoleOutput.WriteError("Error: Input file is required.");
                return 1;
            }

            await using var serviceProvider = serviceCollection.BuildServiceProvider();
            var promptEnhancementService = serviceProvider.GetRequiredService<IPromptEnhancementService>();

            var imageStore = new HierarchicalFileStore(outputDir.FullName);
            var cmd = new PrepareCommand(promptEnhancementService, imageStore, config);
            var options = new PrepareOptions(inputFile.FullName, showAll, limit);

            return await cmd.ExecuteAsync(options, CancellationToken.None);
        });

        return prepareCommand;
    }

    public static Command CreateGenerateCommand(IConfigurationRoot config, ServiceCollection serviceCollection, DirectoryInfo outputDir, int delay, int limit, Option<FileInfo> inputFileOption, Option<string?> idOption, Option<int> variantsOption, Option<int?> limitOption) {
        var generateCommand = new Command("generate", "Generate tokens for monsters from JSON") {
            inputFileOption,
            idOption,
            variantsOption,
            limitOption
        };

        generateCommand.SetAction(parseResult => {
            var id = parseResult.GetValue(idOption);
            var inputFile = parseResult.GetValue(inputFileOption);
            var variants = parseResult.GetValue(variantsOption);

            if (inputFile is null) {
                ConsoleOutput.WriteError("Monsters file is required.");
                return 1;
            }

            if (!inputFile.Exists) {
                ConsoleOutput.WriteError($"Monsters file not found: {inputFile.FullName}");
                return 1;
            }

            ConsoleOutput.WriteLine("Generating...");
            ConsoleOutput.WriteLine($"  input file      : {inputFile.FullName}");
            ConsoleOutput.WriteLine($"  id              : {id ?? "<all>"}");
            ConsoleOutput.WriteLine($"  variants        : {variants}");
            ConsoleOutput.WriteLine($"  delay (ms)      : {delay}");
            ConsoleOutput.WriteLine($"  limit           : {(limit == 0 ? "<none>" : limit.ToString())}");
            ConsoleOutput.WriteLine($"  output          : {outputDir.FullName}");

            using var serviceProvider = serviceCollection.BuildServiceProvider();
            var imageGenerationService = serviceProvider.GetRequiredService<IImageGenerationService>();

            var imageStore = new HierarchicalFileStore(outputDir.FullName);

            var cmd = new GenerateCommand(imageGenerationService, imageStore, config);

            var options = new GenerateOptions(
                InputPath: inputFile.FullName,
                Limit: limit,
                DelayMs: delay,
                NameFilter: id
            );

            cmd.ExecuteAsync(options).GetAwaiter().GetResult();

            return 0;
        });
        return generateCommand;
    }

    public static Command CreateListCommand(DirectoryInfo outputDir, Option<string?> idOrNameOption, Option<string?> filterKindOption) {
        var importOption = new Option<string?>("--import", "-i") {
            Description = "Import JSON file path to list entities from instead of storage"
        };

        var listCommand = new Command("list", "List tokens")
        {
            idOrNameOption,
            filterKindOption,
            importOption
        };

        listCommand.SetAction(async parseResult => {
            var idOrName = parseResult.GetValue(idOrNameOption);
            var typeFilter = Enum.TryParse<AssetKind>(parseResult.GetValue(filterKindOption), out var tf) ? tf : (AssetKind?)null;
            var importPath = parseResult.GetValue(importOption);

            ConsoleOutput.WriteLine("Listing tokens...");
            ConsoleOutput.WriteLine($"  id or name: {idOrName ?? "<any>"}");
            ConsoleOutput.WriteLine($"  kind filter: {(typeFilter.HasValue ? typeFilter.Value.ToString() : "<any>")}");
            ConsoleOutput.WriteLine($"  import from: {importPath ?? "<storage>"}");

            var store = new HierarchicalFileStore(outputDir.FullName);

            var cmd = new ListCommand(store);

            var options = new ListTokensOptions(typeFilter, idOrName, importPath);

            await cmd.ExecuteAsync(options);

            return 0;
        });
        return listCommand;
    }

    public static Command CreateShowCommand(DirectoryInfo outputDir, Option<string?> idOption) {
        var showCommand = new Command("show", "Show a token details by id")
        {
            idOption,
        };

        showCommand.SetAction(async parseResult => {
            var id = parseResult.GetValue(idOption);
            if (string.IsNullOrWhiteSpace(id)) {
                ConsoleOutput.WriteError("Error: --id is required for 'token show'.");
                return 1;
            }

            ConsoleOutput.WriteLine("[MediaGenerator] Showing token info...");
            ConsoleOutput.WriteLine($"  id or name: {id ?? "<any>"}");

            var store = new HierarchicalFileStore(outputDir.FullName);

            var cmd = new ShowCommand(store);

            var options = new ShowTokenOptions(id!);

            cmd.Execute(options);

            return 0;
        });
        return showCommand;
    }

    public static Command CreateDoctorCommand(IConfiguration config, IHttpClientFactory httpClientFactory, DirectoryInfo outputDir) {
        var verboseOption = new Option<bool>("--verbose", "-v") {
            Description = "Show detailed diagnostic information"
        };

        var skipApiOption = new Option<bool>("--skip-api") {
            Description = "Skip API connectivity checks"
        };

        var doctorCommand = new Command("doctor", "Run system diagnostics to verify configuration")
        {
            verboseOption,
            skipApiOption
        };

        doctorCommand.SetAction(async parseResult => {
            var verbose = parseResult.GetValue(verboseOption);
            var skipApi = parseResult.GetValue(skipApiOption);

            var cmd = new DoctorCommand(config, httpClientFactory, outputDir.FullName);
            var options = new DoctorOptions(verbose, skipApi);
            return await cmd.ExecuteAsync(options);
        });

        return doctorCommand;
    }
}