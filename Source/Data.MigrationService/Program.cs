// Check for data migration generation command
if (args.Length > 0 && args[0].Equals("generate-data", StringComparison.OrdinalIgnoreCase)) {
    await RunDataMigrationGeneratorAsync(args);
    return;
}

var builder = Host.CreateApplicationBuilder(args);

// Configure PostgreSQL DbContext using Aspire with explicit migrations assembly
builder.AddNpgsqlDbContext<ApplicationDbContext>(
    ApplicationDbContextOptions.ConnectionStringName,
    configureDbContextOptions: options => options.UseNpgsql(connectionString =>
            connectionString.MigrationsAssembly("VttTools.Data.MigrationService")));

// Register the migration worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
await host.RunAsync();

static async Task RunDataMigrationGeneratorAsync(string[] args) {
    var migrationName = args.Length > 1 ? args[1] : "SeedApplicationSchema";
    var outputPath = Path.Combine(Directory.GetCurrentDirectory(), "Migrations");

    // Parse optional arguments
    string[]? includeTables = null;
    string[]? excludeTables = null;

    for (var i = 2; i < args.Length; i++) {
        if (args[i].StartsWith("--include=", StringComparison.OrdinalIgnoreCase)) {
            includeTables = args[i]["--include=".Length..].Split(',', StringSplitOptions.RemoveEmptyEntries);
        }
        else if (args[i].StartsWith("--exclude=", StringComparison.OrdinalIgnoreCase)) {
            excludeTables = args[i]["--exclude=".Length..].Split(',', StringSplitOptions.RemoveEmptyEntries);
        }
        else if (args[i].StartsWith("--output=", StringComparison.OrdinalIgnoreCase)) {
            outputPath = args[i]["--output=".Length..];
        }
    }

    Console.WriteLine("=== Data Migration Generator ===");
    Console.WriteLine($"Migration Name: {migrationName}");
    Console.WriteLine($"Output Path: {outputPath}");
    if (includeTables is not null)
        Console.WriteLine($"Include Tables: {string.Join(", ", includeTables)}");
    if (excludeTables is not null)
        Console.WriteLine($"Exclude Tables: {string.Join(", ", excludeTables)}");
    Console.WriteLine();

    // Create DbContext using the design-time factory
    var factory = new ApplicationDbContextFactory();
    await using var context = factory.CreateDbContext([]);

    // Ensure output directory exists
    Directory.CreateDirectory(outputPath);

    await DataMigrationGenerator.GenerateAsync(
        context,
        migrationName,
        outputPath,
        includeTables,
        excludeTables);

    Console.WriteLine();
    Console.WriteLine("Data migration generated successfully!");
    Console.WriteLine();
    Console.WriteLine("Usage examples:");
    Console.WriteLine("  dotnet run generate-data SeedApplicationSchema");
    Console.WriteLine("  dotnet run generate-data SeedApplicationSchema --include=Providers,AiModels,PromptTemplates");
    Console.WriteLine("  dotnet run generate-data SeedApplicationSchema --exclude=AuditLogs,Jobs,JobItems");
}