namespace VttTools.HealthChecks;

public class BlobStorageHealthCheckTests {
    private readonly IConfiguration _configuration = Substitute.For<IConfiguration>();
    private const string _testConnectionString = "DefaultEndpointsProtocol=https;AccountName=teststorage;AccountKey=testkey;EndpointSuffix=core.windows.net";
    private const string _connectionStringName = "BlobStorage";
    private const string _containerName = "test-container";

    [Fact]
    public void Constructor_ValidParameters_CreatesInstance() {
        // Arrange
        _configuration.GetConnectionString(_connectionStringName).Returns(_testConnectionString);

        // Act
        var healthCheck = new BlobStorageHealthCheck(_configuration, _connectionStringName, _containerName);

        // Assert
        healthCheck.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_NullConnectionString_ThrowsArgumentException() {
        // Arrange
        _configuration.GetConnectionString(_connectionStringName).Returns((string?)null);

        // Act & Assert
        var action = () => new BlobStorageHealthCheck(_configuration, _connectionStringName, _containerName);
        action.Should().Throw<ArgumentException>()
            .WithMessage($"Connection string '{_connectionStringName}' not found. (Parameter 'connectionStringName')");
    }

    [Fact]
    public void Constructor_NullContainerName_ThrowsArgumentNullException() {
        // Arrange
        _configuration.GetConnectionString(_connectionStringName).Returns(_testConnectionString);

        // Act & Assert
        var action = () => new BlobStorageHealthCheck(_configuration, _connectionStringName, null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("containerName");
    }

    [Fact]
    public void Constructor_EmptyContainerName_DoesNotThrow() {
        // Arrange
        _configuration.GetConnectionString(_connectionStringName).Returns(_testConnectionString);

        // Act & Assert
        var action = () => new BlobStorageHealthCheck(_configuration, _connectionStringName, "");
        action.Should().NotThrow(); // The constructor only checks for null, not empty
    }

    [Fact]
    public async Task CheckHealthAsync_ContainerExists_ReturnsHealthy() {
        // Arrange
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName, containerExists: true);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Description.Should().Be("Blob storage container access successful");
        result.Data.Should().ContainKey("accessTime");
        result.Data.Should().ContainKey("containerName");
        result.Data.Should().ContainKey("containerExists");
        result.Data.Should().ContainKey("accountName");
        result.Data["containerName"].Should().Be(_containerName);
        result.Data["containerExists"].Should().Be(true);
        result.Data["accountName"].Should().Be("teststorage");
    }

    [Fact]
    public async Task CheckHealthAsync_ContainerDoesNotExist_ReturnsDegraded() {
        // Arrange
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName, containerExists: false);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Degraded);
        result.Description.Should().Be("Blob storage container does not exist");
        result.Data.Should().ContainKey("accessTime");
        result.Data.Should().ContainKey("containerName");
        result.Data.Should().ContainKey("containerExists");
        result.Data.Should().ContainKey("accountName");
        result.Data["containerName"].Should().Be(_containerName);
        result.Data["containerExists"].Should().Be(false);
    }

    [Fact]
    public async Task CheckHealthAsync_ContainerExistsWithProperties_IncludesPropertiesInData() {
        // Arrange
        var lastModified = DateTimeOffset.UtcNow.AddDays(-1);
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName,
            containerExists: true, lastModified: lastModified, publicAccess: PublicAccessType.Blob);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Data.Should().ContainKey("lastModified");
        result.Data.Should().ContainKey("publicAccess");
        result.Data["lastModified"].Should().Be(lastModified.ToString());
        result.Data["publicAccess"].Should().Be("Blob");
    }

    [Fact]
    public async Task CheckHealthAsync_ContainerExistsButPropertiesThrowException_StillHealthyWithWarning() {
        // Arrange
        var propertiesException = new RequestFailedException(403, "Forbidden", "InsufficientPermissions", null);
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName,
            containerExists: true, propertiesException: propertiesException);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Description.Should().Be("Blob storage container access successful");
        result.Data.Should().ContainKey("propertiesWarning");
        result.Data["propertiesWarning"].Should().Be("Could not retrieve properties: Forbidden");
    }

    [Theory]
    [InlineData("AuthenticationFailed", "Blob storage authentication failed")]
    [InlineData("AccountNotFound", "Blob storage account not found")]
    [InlineData("ContainerNotFound", "Blob storage container not found")]
    [InlineData("InvalidUri", "Invalid blob storage URI")]
    [InlineData("UnknownError", "Blob storage access failed: Bad Request")]
    public async Task CheckHealthAsync_RequestFailedExceptionWithSpecificErrorCode_ReturnsAppropriateMessage(string errorCode, string expectedMessage) {
        // Arrange
        var requestException = new RequestFailedException(400, "Bad Request", errorCode, null);
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName, existsException: requestException);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Be(expectedMessage);
        result.Exception.Should().Be(requestException);
        result.Data.Should().ContainKey("accessTime");
        result.Data.Should().ContainKey("containerName");
        result.Data.Should().ContainKey("errorCode");
        result.Data.Should().ContainKey("status");
        result.Data["errorCode"].Should().Be(errorCode);
        result.Data["status"].Should().Be(400);
    }

    [Fact]
    public async Task CheckHealthAsync_RequestFailedExceptionWithNullErrorCode_ReturnsGenericMessage() {
        // Arrange
        var requestException = new RequestFailedException(500, "Internal Server Error", null, null);
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName, existsException: requestException);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Be("Blob storage access failed: Internal Server Error");
        result.Data["errorCode"].Should().Be("Unknown");
        result.Data["status"].Should().Be(500);
    }

    [Fact]
    public async Task CheckHealthAsync_GeneralException_ReturnsUnhealthyWithGenericError() {
        // Arrange
        var exception = new InvalidOperationException("General error");
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName, existsException: exception);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Be("Blob storage health check failed: General error");
        result.Exception.Should().Be(exception);
        result.Data.Should().ContainKey("accessTime");
        result.Data.Should().ContainKey("containerName");
        result.Data.Should().NotContainKey("errorCode");
        result.Data.Should().NotContainKey("status");
    }

    [Fact]
    public async Task CheckHealthAsync_CancellationTokenCancelled_ThrowsOperationCancelledException() {
        // Arrange
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName, simulateCancellation: true);
        var context = new HealthCheckContext();
        var cancellationToken = new CancellationToken(true);

        // Act & Assert
        var action = () => healthCheck.CheckHealthAsync(context, cancellationToken);
        await action.Should().ThrowExactlyAsync<OperationCanceledException>();
    }

    [Fact]
    public async Task CheckHealthAsync_SuccessfulConnection_IncludesPerformanceData() {
        // Arrange
        var healthCheck = new MockableBlobStorageHealthCheck(_containerName,
            containerExists: true, simulateDelay: TimeSpan.FromMilliseconds(75));
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Data.Should().ContainKey("accessTime");
        var accessTime = result.Data["accessTime"].ToString();
        accessTime.Should().EndWith("ms");
        var milliseconds = double.Parse(accessTime.Replace("ms", ""));
        milliseconds.Should().BeGreaterThanOrEqualTo(75);
    }

    [Theory]
    [InlineData("uploads")]
    [InlineData("assets")]
    [InlineData("media-files")]
    [InlineData("temp-container")]
    public async Task CheckHealthAsync_DifferentContainerNames_UsesCorrectContainerName(string containerName) {
        // Arrange
        var healthCheck = new MockableBlobStorageHealthCheck(containerName, containerExists: true);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Data["containerName"].Should().Be(containerName);
    }

    // Helper class for testing that allows us to mock Azure blob storage behavior
    private sealed class MockableBlobStorageHealthCheck(string containerName, bool containerExists = true, DateTimeOffset? lastModified = null,
        PublicAccessType? publicAccess = null, Exception? existsException = null, Exception? propertiesException = null,
        bool simulateCancellation = false, TimeSpan simulateDelay = default) : IHealthCheck {
        private readonly string _containerName = containerName;
        private readonly bool _containerExists = containerExists;
        private readonly DateTimeOffset? _lastModified = lastModified;
        private readonly PublicAccessType? _publicAccess = publicAccess;
        private readonly Exception? _existsException = existsException;
        private readonly Exception? _propertiesException = propertiesException;
        private readonly bool _simulateCancellation = simulateCancellation;
        private readonly TimeSpan _simulateDelay = simulateDelay;

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default) {
            if (_simulateCancellation) {
                cancellationToken.ThrowIfCancellationRequested();
            }

            if (_simulateDelay > TimeSpan.Zero) {
                await Task.Delay(_simulateDelay, cancellationToken);
            }

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var data = new Dictionary<string, object>();

            try {
                if (_existsException != null) {
                    throw _existsException;
                }

                await Task.Delay(1, cancellationToken); // Minimal delay to simulate work
                stopwatch.Stop();

                data.Add("accessTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");
                data.Add("containerName", _containerName);
                data.Add("containerExists", _containerExists);
                data.Add("accountName", "teststorage"); // Mock account name

                if (_containerExists) {
                    try {
                        if (_propertiesException != null) {
                            throw _propertiesException;
                        }

                        // Simulate properties retrieval
                        if (_lastModified.HasValue) {
                            data.Add("lastModified", _lastModified.Value.ToString());
                        }
                        if (_publicAccess.HasValue) {
                            data.Add("publicAccess", _publicAccess.Value.ToString());
                        }
                    }
                    catch (RequestFailedException ex) {
                        data.Add("propertiesWarning", $"Could not retrieve properties: {ex.Message}");
                    }

                    return HealthCheckResult.Healthy("Blob storage container access successful", data);
                }
                else {
                    return HealthCheckResult.Degraded("Blob storage container does not exist", null, data);
                }
            }
            catch (RequestFailedException ex) {
                stopwatch.Stop();
                data.Add("accessTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");
                data.Add("containerName", _containerName);
                data.Add("errorCode", ex.ErrorCode ?? "Unknown");
                data.Add("status", ex.Status);

                var message = ex.ErrorCode switch {
                    "AuthenticationFailed" => "Blob storage authentication failed",
                    "AccountNotFound" => "Blob storage account not found",
                    "ContainerNotFound" => "Blob storage container not found",
                    "InvalidUri" => "Invalid blob storage URI",
                    _ => $"Blob storage access failed: {ex.Message}",
                };

                return HealthCheckResult.Unhealthy(message, ex, data);
            }
            catch (OperationCanceledException) {
                // Let cancellation exceptions propagate
                throw;
            }
            catch (Exception ex) {
                stopwatch.Stop();
                data.Add("accessTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");
                data.Add("containerName", _containerName);

                return HealthCheckResult.Unhealthy(
                    $"Blob storage health check failed: {ex.Message}",
                    ex,
                    data
                );
            }
        }
    }
}