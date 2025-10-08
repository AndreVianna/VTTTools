using System.Data.Common;
using System.Diagnostics;

using Microsoft.Data.SqlClient;

namespace VttTools.HealthChecks;

/// <summary>
/// Health check implementation for SQL Server database connectivity.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="DatabaseHealthCheck"/> class.
/// </remarks>
/// <param name="configuration">The configuration instance to retrieve connection strings.</param>
/// <param name="connectionStringName">The name of the connection string to use.</param>
/// <exception cref="ArgumentException">Thrown when the connection string is not found.</exception>
public class DatabaseHealthCheck(IConfiguration configuration,
                                 string connectionStringName) : IHealthCheck {
    private readonly string _connectionString = configuration.GetConnectionString(connectionStringName)
            ?? throw new ArgumentException($"Connection string '{connectionStringName}' not found.", nameof(connectionStringName));

    /// <summary>
    /// Checks the health of the database connection by executing a simple query.
    /// </summary>
    /// <param name="context">The health check context.</param>
    /// <param name="cancellationToken">The cancellation token to cancel the operation.</param>
    /// <returns>A task that represents the asynchronous health check operation.</returns>
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default) {
        var stopwatch = Stopwatch.StartNew();
        var data = new Dictionary<string, object>();

        try {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken);

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT 1";
            command.CommandTimeout = 5; // 5 second timeout

            var result = await command.ExecuteScalarAsync(cancellationToken);

            stopwatch.Stop();

            data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds}ms");
            data.Add("server", connection.DataSource);
            data.Add("database", connection.Database);
            data.Add("queryResult", result?.ToString() ?? "null");

            return result?.ToString() == "1"
                ? HealthCheckResult.Healthy("Database connection successful", data)
                : HealthCheckResult.Unhealthy("Database query returned unexpected result", null, data);
        }
        catch (SqlException ex) {
            stopwatch.Stop();
            data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds}ms");
            data.Add("sqlErrorNumber", ex.Number);
            data.Add("sqlErrorSeverity", ex.Class);
            data.Add("sqlErrorState", ex.State);

            return HealthCheckResult.Unhealthy(
                $"Database connection failed: {ex.Message}",
                ex,
                data
            );
        }
        catch (DbException ex) {
            stopwatch.Stop();
            data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds}ms");
            data.Add("errorCode", ex.ErrorCode);

            return HealthCheckResult.Unhealthy(
                $"Database connection failed: {ex.Message}",
                ex,
                data
            );
        }
        catch (Exception ex) {
            stopwatch.Stop();
            data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds}ms");

            return HealthCheckResult.Unhealthy(
                $"Database health check failed: {ex.Message}",
                ex,
                data
            );
        }
    }
}