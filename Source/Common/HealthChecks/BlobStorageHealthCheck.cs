
namespace VttTools.HealthChecks;

/// <summary>
/// Health check implementation for Azure Blob Storage connectivity.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="BlobStorageHealthCheck"/> class.
/// </remarks>
/// <param name="configuration">The configuration instance to retrieve connection strings.</param>
/// <param name="connectionStringName">The name of the connection string to use.</param>
/// <param name="containerName">The name of the blob container to test access to.</param>
/// <exception cref="ArgumentException">Thrown when the connection string is not found.</exception>
public class BlobStorageHealthCheck(IConfiguration configuration,
                                    string connectionStringName,
                                    string containerName) : IHealthCheck {
    private readonly string _connectionString = configuration.GetConnectionString(connectionStringName)
            ?? throw new ArgumentException($"Connection string '{connectionStringName}' not found.", nameof(connectionStringName));
    private readonly string _containerName = containerName ?? throw new ArgumentNullException(nameof(containerName));

    /// <summary>
    /// Checks the health of the blob storage connection by testing container access.
    /// </summary>
    /// <param name="context">The health check context.</param>
    /// <param name="cancellationToken">The cancellation token to cancel the operation.</param>
    /// <returns>A task that represents the asynchronous health check operation.</returns>
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default) {
        var stopwatch = Stopwatch.StartNew();
        var data = new Dictionary<string, object>();

        try {
            var blobServiceClient = new BlobServiceClient(_connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

            // Test container access by checking if it exists
            var containerExists = await containerClient.ExistsAsync(cancellationToken);
            stopwatch.Stop();
            data.Add("accessTime", $"{stopwatch.ElapsedMilliseconds}ms");
            data.Add("containerName", _containerName);
            data.Add("accountName", blobServiceClient.AccountName);
            if (containerExists.Value) {
                data.Add("containerExists", containerExists.Value);
            }
            else {
                await containerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
                data.Add("containerCreated", true);
            }

            try {
                var properties = await containerClient.GetPropertiesAsync(cancellationToken: cancellationToken);
                data.Add("lastModified", properties.Value.LastModified.ToString() ?? "Unknown");
                data.Add("publicAccess", properties.Value.PublicAccess.ToString() ?? "Unknown");
            }
            catch (RequestFailedException ex) {
                data.Add("propertiesWarning", $"Could not retrieve properties: {ex.Message}");
            }

            return HealthCheckResult.Healthy("Blob storage container created and accessible", data);
        }
        catch (RequestFailedException ex) {
            stopwatch.Stop();
            data.Add("accessTime", $"{stopwatch.ElapsedMilliseconds}ms");
            data.Add("containerName", _containerName);
            data.Add("errorCode", ex.ErrorCode ?? "Unknown");
            data.Add("status", ex.Status);

            var message = ex.ErrorCode switch {
                "AuthenticationFailed" => "Blob storage authentication failed",
                "AccountNotFound" => "Blob storage account not found",
                "ContainerNotFound" => "Blob storage container not found",
                "InvalidUri" => "Invalid blob storage URI",
                _ => $"Blob storage access failed: {ex.Message}"
            };

            return HealthCheckResult.Unhealthy(message, ex, data);
        }
        catch (Exception ex) {
            stopwatch.Stop();
            data.Add("accessTime", $"{stopwatch.ElapsedMilliseconds}ms");
            data.Add("containerName", _containerName);

            return HealthCheckResult.Unhealthy(
                $"Blob storage health check failed: {ex.Message}",
                ex,
                data
            );
        }
    }
}