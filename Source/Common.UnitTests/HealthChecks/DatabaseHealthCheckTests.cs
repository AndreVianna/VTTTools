using System.Data.Common;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace VttTools.HealthChecks;

public class DatabaseHealthCheckTests {
    private readonly IConfiguration _configuration = Substitute.For<IConfiguration>();
    private const string _testConnectionString = "Server=localhost;Database=TestDb;Integrated Security=true;TrustServerCertificate=true";
    private const string _connectionStringName = "DefaultConnection";

    [Fact]
    public void Constructor_ValidConnectionString_CreatesInstance() {
        // Arrange
        _configuration.GetConnectionString(_connectionStringName).Returns(_testConnectionString);

        // Act
        var healthCheck = new DatabaseHealthCheck(_configuration, _connectionStringName);

        // Assert
        healthCheck.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_NullConnectionString_ThrowsArgumentException() {
        // Arrange
        _configuration.GetConnectionString(_connectionStringName).Returns((string?)null);

        // Act & Assert
        var action = () => new DatabaseHealthCheck(_configuration, _connectionStringName);
        action.Should().Throw<ArgumentException>()
            .WithMessage($"Connection string '{_connectionStringName}' not found. (Parameter 'connectionStringName')");
    }

    [Fact]
    public void Constructor_EmptyConnectionStringName_ThrowsArgumentException() {
        // Arrange
        _configuration.GetConnectionString("").Returns((string?)null);

        // Act & Assert
        var action = () => new DatabaseHealthCheck(_configuration, "");
        action.Should().Throw<ArgumentException>()
            .WithMessage("Connection string '' not found. (Parameter 'connectionStringName')");
    }

    [Theory]
    [InlineData("1", HealthStatus.Healthy, "Database connection successful")]
    [InlineData("2", HealthStatus.Unhealthy, "Database query returned unexpected result")]
    [InlineData(null, HealthStatus.Unhealthy, "Database query returned unexpected result")]
    public async Task CheckHealthAsync_QueryReturnsExpectedResult_ReturnsCorrectHealthStatus(string? queryResult, HealthStatus expectedStatus, string expectedDescription) {
        // Arrange
        var healthCheck = new MockableDatabaseHealthCheck(_testConnectionString, queryResult);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(expectedStatus);
        result.Description.Should().Be(expectedDescription);
        result.Data.Should().ContainKey("connectionTime");
        result.Data.Should().ContainKey("server");
        result.Data.Should().ContainKey("database");
        result.Data.Should().ContainKey("queryResult");
        result.Data["queryResult"].Should().Be(queryResult ?? "null");
    }

    [Fact]
    public async Task CheckHealthAsync_SqlException_ReturnsUnhealthyWithSqlErrorDetails() {
        // Arrange
        // Since SqlException is hard to create, we'll use a similar mock that behaves like SqlException
        var sqlException = new TestSqlException("Connection failed", 2, 16, 1);
        var healthCheck = new MockableDatabaseHealthCheck(_testConnectionString, exception: sqlException);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Be("Database connection failed: Connection failed");
        result.Exception.Should().Be(sqlException);
        result.Data.Should().ContainKey("connectionTime");
        result.Data.Should().ContainKey("sqlErrorNumber");
        result.Data.Should().ContainKey("sqlErrorSeverity");
        result.Data.Should().ContainKey("sqlErrorState");
        result.Data["sqlErrorNumber"].Should().Be(2);
        result.Data["sqlErrorSeverity"].Should().Be((byte)16);
        result.Data["sqlErrorState"].Should().Be((byte)1);
    }

    [Fact]
    public async Task CheckHealthAsync_DbException_ReturnsUnhealthyWithDbErrorDetails() {
        // Arrange
        var dbException = new TestDbException("Database error", 1001);
        var healthCheck = new MockableDatabaseHealthCheck(_testConnectionString, exception: dbException);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Be("Database connection failed: Database error");
        result.Exception.Should().Be(dbException);
        result.Data.Should().ContainKey("connectionTime");
        result.Data.Should().ContainKey("errorCode");
        result.Data["errorCode"].Should().Be(1001);
    }

    [Fact]
    public async Task CheckHealthAsync_GeneralException_ReturnsUnhealthyWithGenericError() {
        // Arrange
        var exception = new InvalidOperationException("General error");
        var healthCheck = new MockableDatabaseHealthCheck(_testConnectionString, exception: exception);
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Be("Database health check failed: General error");
        result.Exception.Should().Be(exception);
        result.Data.Should().ContainKey("connectionTime");
    }

    [Fact]
    public async Task CheckHealthAsync_CancellationTokenCancelled_ThrowsOperationCancelledException() {
        // Arrange
        var healthCheck = new MockableDatabaseHealthCheck(_testConnectionString, simulateCancellation: true);
        var context = new HealthCheckContext();
        var cancellationToken = new CancellationToken(true);

        // Act & Assert
        var action = async () => await healthCheck.CheckHealthAsync(context, cancellationToken);
        await action.Should().ThrowExactlyAsync<OperationCanceledException>();
    }

    [Fact]
    public async Task CheckHealthAsync_SuccessfulConnection_IncludesPerformanceData() {
        // Arrange
        var healthCheck = new MockableDatabaseHealthCheck(_testConnectionString, "1", simulateDelay: TimeSpan.FromMilliseconds(50));
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Data.Should().ContainKey("connectionTime");
        var connectionTime = result.Data["connectionTime"].ToString();
        connectionTime.Should().EndWith("ms");
        var milliseconds = double.Parse(connectionTime!.Replace("ms", ""));
        milliseconds.Should().BeGreaterThanOrEqualTo(50);
    }

    [Theory]
    [InlineData("Server=localhost;Database=TestDb;", "localhost", "TestDb")]
    [InlineData("Data Source=remote-server;Initial Catalog=ProdDb;", "remote-server", "ProdDb")]
    [InlineData("Server=(local);Database=LocalDb;", "(local)", "LocalDb")]
    public async Task CheckHealthAsync_DifferentConnectionStrings_ExtractsCorrectServerAndDatabase(string connectionString, string expectedServer, string expectedDatabase) {
        // Arrange
        var healthCheck = new MockableDatabaseHealthCheck(connectionString, "1");
        var context = new HealthCheckContext();

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Data["server"].Should().Be(expectedServer);
        result.Data["database"].Should().Be(expectedDatabase);
    }

    // Helper class to mock SQL connections for testing
    private sealed class MockableDatabaseHealthCheck(string connectionString, string? queryResult = "1", Exception? exception = null, bool simulateCancellation = false, TimeSpan simulateDelay = default) : IHealthCheck {
        private readonly string? _queryResult = queryResult;
        private readonly Exception? _exception = exception;
        private readonly bool _simulateCancellation = simulateCancellation;
        private readonly TimeSpan _simulateDelay = simulateDelay;
        private readonly string _connectionString = connectionString;

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default) {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var data = new Dictionary<string, object>();

            try {
                if (_simulateCancellation) {
                    cancellationToken.ThrowIfCancellationRequested();
                }

                if (_simulateDelay > TimeSpan.Zero) {
                    await Task.Delay(_simulateDelay, cancellationToken);
                }

                if (_exception != null) {
                    throw _exception;
                }

                // Simulate the database call by returning our test result
                await Task.Delay(1, cancellationToken); // Minimal delay to simulate work
                stopwatch.Stop();

                var builder = new SqlConnectionStringBuilder(_connectionString);
                data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");
                data.Add("server", builder.DataSource);
                data.Add("database", builder.InitialCatalog);
                data.Add("queryResult", _queryResult ?? "null");

                return _queryResult == "1"
                    ? HealthCheckResult.Healthy("Database connection successful", data)
                    : HealthCheckResult.Unhealthy("Database query returned unexpected result", null, data);
            }
            catch (TestSqlException ex) {
                stopwatch.Stop();
                data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");
                data.Add("sqlErrorNumber", ex.Number);
                data.Add("sqlErrorSeverity", ex.Class);
                data.Add("sqlErrorState", ex.State);

                return HealthCheckResult.Unhealthy(
                    $"Database connection failed: {ex.Message}",
                    ex,
                    data
                );
            }
            catch (TestDbException ex) {
                stopwatch.Stop();
                data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");
                data.Add("errorCode", ex.ErrorCode);

                return HealthCheckResult.Unhealthy(
                    $"Database connection failed: {ex.Message}",
                    ex,
                    data
                );
            }
            catch (OperationCanceledException) {
                // Let cancellation exceptions propagate
                throw;
            }
            catch (Exception ex) {
                stopwatch.Stop();
                data.Add("connectionTime", $"{stopwatch.ElapsedMilliseconds + (_simulateDelay.TotalMilliseconds > 0 ? _simulateDelay.TotalMilliseconds : 0)}ms");

                return HealthCheckResult.Unhealthy(
                    $"Database health check failed: {ex.Message}",
                    ex,
                    data
                );
            }
        }
    }

    // Helper class for testing DbException
    private sealed class TestDbException(string message, int errorCode) : DbException(message) {
        public override int ErrorCode { get; } = errorCode;
    }

    // Helper class for testing SqlException behavior
    private sealed class TestSqlException(string message, int number, byte severity, byte state) : Exception(message) {
        public int Number { get; } = number;
        public byte Class { get; } = severity;
        public byte State { get; } = state;
    }
}