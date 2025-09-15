namespace VttTools.Data.MigrationService;

/// <summary>
/// Background service that runs database migrations once and exits.
/// </summary>
public sealed class Worker(
    ILogger<Worker> logger,
    IServiceProvider serviceProvider,
    IHostApplicationLifetime hostLifetime) : BackgroundService {

    /// <summary>
    /// Executes the migration worker task.
    /// </summary>
    /// <param name="stoppingToken">Cancellation token that triggers when the host is shutting down.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        using var activity = Activity.Current?.Source.StartActivity(nameof(ExecuteAsync));

        try {
            logger.LogInformation("Starting database migration service");

            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Log migration discovery information
            await LogMigrationDiscoveryAsync(dbContext, stoppingToken);

            // Test migration assembly discovery (without database connection)
            LogMigrationAssemblyInfo(dbContext);

            // Check and apply migrations
            logger.LogInformation("Applying database migrations");
            await dbContext.Database.MigrateAsync(stoppingToken);

            // Log completion status
            await LogMigrationStatusAsync(dbContext, stoppingToken);

            logger.LogInformation("Database migrations completed successfully");
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("migrations")) {
            logger.LogError(ex, "Migration discovery or configuration error: {ErrorMessage}", ex.Message);
            logger.LogError("Ensure migrations assembly is correctly configured and migration files are present");
            throw;
        }
        catch (SqlException ex) {
            logger.LogError(ex, "Database connection or execution error during migration: {ErrorMessage}", ex.Message);
            logger.LogError("Verify database connection string and permissions");
            throw;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unexpected error during database migration: {ErrorMessage}", ex.Message);
            throw;
        }
        finally {
            // Stop the host after migration completes (success or failure)
            hostLifetime.StopApplication();
        }
    }

    /// <summary>
    /// Logs information about discovered migrations.
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    /// <param name="stoppingToken">Cancellation token.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    private async Task LogMigrationDiscoveryAsync(ApplicationDbContext dbContext, CancellationToken stoppingToken) {
        try {
            var allMigrations = dbContext.Database.GetMigrations();
            var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync(stoppingToken);
            var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync(stoppingToken);

            logger.LogInformation("Migration discovery completed:");
            logger.LogInformation("  Total migrations found: {TotalCount}", allMigrations.Count());
            logger.LogInformation("  Applied migrations: {AppliedCount}", appliedMigrations.Count());
            logger.LogInformation("  Pending migrations: {PendingCount}", pendingMigrations.Count());

            if (allMigrations.Any()) {
                logger.LogDebug("All migrations: {AllMigrations}", string.Join(", ", allMigrations));
            }

            if (pendingMigrations.Any()) {
                logger.LogInformation("Pending migrations to apply: {PendingMigrations}", string.Join(", ", pendingMigrations));
            }
            else {
                logger.LogInformation("Database is up to date - no pending migrations");
            }
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Could not retrieve migration information: {ErrorMessage}", ex.Message);
        }
    }

    /// <summary>
    /// Logs final migration status after completion.
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    /// <param name="stoppingToken">Cancellation token.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    private async Task LogMigrationStatusAsync(ApplicationDbContext dbContext, CancellationToken stoppingToken) {
        try {
            var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync(stoppingToken);
            logger.LogInformation("Migration completed - Total applied migrations: {AppliedCount}", appliedMigrations.Count());

            if (appliedMigrations.Any()) {
                var lastMigration = appliedMigrations.Last();
                logger.LogInformation("Latest applied migration: {LastMigration}", lastMigration);
            }
        }
        catch (Exception ex) {
            logger.LogWarning(ex, "Could not retrieve final migration status: {ErrorMessage}", ex.Message);
        }
    }

    /// <summary>
    /// Logs information about migration assembly configuration (does not require database connection).
    /// </summary>
    /// <param name="dbContext">The database context.</param>
    private void LogMigrationAssemblyInfo(ApplicationDbContext dbContext) {
        try {
            // Get migrations from assembly without database connection
            var allMigrations = dbContext.Database.GetMigrations();

            logger.LogInformation("Migration assembly discovery test:");
            logger.LogInformation("  Configured migrations assembly: VttTools.Data.MigrationService");
            logger.LogInformation("  Total migrations found in assembly: {TotalCount}", allMigrations.Count());

            if (allMigrations.Any()) {
                logger.LogInformation("  First migration: {FirstMigration}", allMigrations.First());
                logger.LogInformation("  Last migration: {LastMigration}", allMigrations.Last());
                logger.LogDebug("  All migrations: {AllMigrations}", string.Join(", ", allMigrations));
            }
            else {
                logger.LogWarning("  No migrations found in assembly - verify migrations assembly configuration");
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to discover migrations in assembly: {ErrorMessage}", ex.Message);
        }
    }
}