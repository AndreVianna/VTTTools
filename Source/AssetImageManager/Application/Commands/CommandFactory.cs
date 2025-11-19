namespace VttTools.AssetImageManager.Application.Commands;

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
                Console.Error.WriteLine("Error: Input file is required.");
                return 1;
            }

            await using var serviceProvider = serviceCollection.BuildServiceProvider();
            var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();

            var imageStore = new HierarchicalImageStore(outputDir.FullName);
            var cmd = new PrepareCommand(httpClientFactory, imageStore, config);
            var options = new PrepareOptions(inputFile.FullName, showAll, limit);

            return await cmd.ExecuteAsync(options, CancellationToken.None);
        });

        return prepareCommand;
    }

    public static Command CreateGenerateCommand(IConfigurationRoot config, ServiceCollection serviceCollection, DirectoryInfo outputDir, int delay, int limit, Option<FileInfo> inputFileOption, Option<string?> idOption, Option<int> variantsOption, Option<int?> limitOption) {
        var imageTypeArgument = new Argument<string>("imageType") {
            Description = "Image type to generate: topdown, miniature, photo, portrait, or all",
            DefaultValueFactory = (_) => "all"
        };

        var generateCommand = new Command("generate", "Generate tokens for monsters from JSON") {
            imageTypeArgument,
            inputFileOption,
            idOption,
            variantsOption,
            limitOption
        };

        generateCommand.SetAction(parseResult => {
            var imageType = parseResult.GetValue(imageTypeArgument) ?? "all";
            var id = parseResult.GetValue(idOption);
            var inputFile = parseResult.GetValue(inputFileOption);
            var variants = parseResult.GetValue(variantsOption);

            if (inputFile is null) {
                Console.Error.WriteLine("Monsters file is required.");
                return 1;
            }

            if (!inputFile.Exists) {
                Console.Error.WriteLine($"Monsters file not found: {inputFile.FullName}");
                return 1;
            }

            Console.WriteLine("Generating...");
            Console.WriteLine($"  input file      : {inputFile.FullName}");
            Console.WriteLine($"  image type      : {imageType}");
            Console.WriteLine($"  id              : {id ?? "<all>"}");
            Console.WriteLine($"  variants        : {variants}");
            Console.WriteLine($"  delay (ms)      : {delay}");
            Console.WriteLine($"  limit           : {(limit == 0 ? "<none>" : limit.ToString())}");
            Console.WriteLine($"  output          : {outputDir.FullName}");

            using var serviceProvider = serviceCollection.BuildServiceProvider();
            var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();

            var imageStore = new HierarchicalImageStore(outputDir.FullName);

            var cmd = new GenerateCommand(httpClientFactory, imageStore, config);

            var options = new GenerateTokensOptions(
                InputPath: inputFile.FullName,
                ImageType: imageType,
                Limit: limit,
                DelayMs: delay,
                IdFilter: id
            );

            cmd.ExecuteAsync(options).GetAwaiter().GetResult();

            return 0;
        });
        return generateCommand;
    }

    public static Command CreateListCommand(DirectoryInfo outputDir, Option<string?> idOrNameOption, Option<string?> filterKindOption) {
        var listCommand = new Command("list", "List tokens")
        {
            idOrNameOption,
            filterKindOption
        };

        listCommand.SetAction(async parseResult => {
            var idOrName = parseResult.GetValue(idOrNameOption);
            var typeFilter = Enum.TryParse<EntityType>(parseResult.GetValue(filterKindOption), out var tf) ? tf : (EntityType?)null;

            Console.WriteLine("Listing tokens...");
            Console.WriteLine($"  id or name: {idOrName ?? "<any>"}");
            Console.WriteLine($"  kind filter: {(typeFilter.HasValue ? typeFilter.Value.ToString() : "<any>")}");

            var store = new HierarchicalImageStore(outputDir.FullName);

            var cmd = new ListCommand(store);

            var options = new ListTokensOptions(typeFilter, idOrName);

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
                Console.Error.WriteLine("Error: --id is required for 'token show'.");
                return 1;
            }

            Console.WriteLine("[AssetImageManager] Showing token info...");
            Console.WriteLine($"  id or name: {id ?? "<any>"}");

            var store = new HierarchicalImageStore(outputDir.FullName);

            var cmd = new ShowCommand(store);

            var options = new ShowTokenOptions(id!);

            await cmd.ExecuteAsync(options);

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
