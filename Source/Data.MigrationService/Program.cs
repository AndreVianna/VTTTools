using VttTools.Data.MigrationService;

var builder = Host.CreateApplicationBuilder(args);

// Configure SQL Server DbContext using Aspire with explicit migrations assembly
builder.AddSqlServerDbContext<ApplicationDbContext>(
    ApplicationDbContextOptions.ConnectionStringName,
    configureDbContextOptions: options => options.UseSqlServer(connectionString =>
            connectionString.MigrationsAssembly("VttTools.Data.MigrationService")));

// Register the migration worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();

await host.RunAsync();
