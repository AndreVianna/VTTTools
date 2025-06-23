using System.Text;
using Microsoft.Extensions.Configuration;
using VttTools.HealthChecks;

namespace VttTools.HealthChecks;

public class DetailedHealthCheckResponseWriterTests {
    [Fact]
    public async Task WriteResponse_HealthyReport_WritesCorrectJsonResponse() {
        // Arrange
        var context = CreateHttpContext();
        var report = CreateHealthReport(HealthStatus.Healthy, "Test healthy check", TimeSpan.FromMilliseconds(100));

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        context.Response.ContentType.Should().Be("application/json; charset=utf-8");
        var responseBody = GetResponseBody(context);
        
        var jsonDocument = JsonDocument.Parse(responseBody);
        var root = jsonDocument.RootElement;
        
        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.GetProperty("totalDuration").GetString().Should().EndWith("ms");
        root.GetProperty("results").ValueKind.Should().Be(JsonValueKind.Array);
        root.GetProperty("results").GetArrayLength().Should().Be(1);
        
        var result = root.GetProperty("results")[0];
        result.GetProperty("name").GetString().Should().Be("TestCheck");
        result.GetProperty("status").GetString().Should().Be("Healthy");
        result.GetProperty("duration").GetString().Should().EndWith("ms");
        result.GetProperty("description").GetString().Should().Be("Test healthy check");
    }

    [Fact]
    public async Task WriteResponse_UnhealthyReport_WritesCorrectJsonResponse() {
        // Arrange
        var context = CreateHttpContext();
        var exception = new InvalidOperationException("Test exception");
        var report = CreateHealthReport(HealthStatus.Unhealthy, "Test unhealthy check", TimeSpan.FromMilliseconds(200), exception);

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        context.Response.ContentType.Should().Be("application/json; charset=utf-8");
        var responseBody = GetResponseBody(context);
        
        var jsonDocument = JsonDocument.Parse(responseBody);
        var root = jsonDocument.RootElement;
        
        root.GetProperty("status").GetString().Should().Be("Unhealthy");
        root.GetProperty("totalDuration").GetString().Should().EndWith("ms");
        root.GetProperty("results").ValueKind.Should().Be(JsonValueKind.Array);
        root.GetProperty("results").GetArrayLength().Should().Be(1);
        
        var result = root.GetProperty("results")[0];
        result.GetProperty("name").GetString().Should().Be("TestCheck");
        result.GetProperty("status").GetString().Should().Be("Unhealthy");
        result.GetProperty("duration").GetString().Should().EndWith("ms");
        result.GetProperty("description").GetString().Should().Be("Test unhealthy check");
        result.GetProperty("exception").GetString().Should().Be("Test exception");
    }

    [Fact]
    public async Task WriteResponse_DegradedReport_WritesCorrectJsonResponse() {
        // Arrange
        var context = CreateHttpContext();
        var report = CreateHealthReport(HealthStatus.Degraded, "Test degraded check", TimeSpan.FromMilliseconds(150));

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        context.Response.ContentType.Should().Be("application/json; charset=utf-8");
        var responseBody = GetResponseBody(context);
        
        var jsonDocument = JsonDocument.Parse(responseBody);
        var root = jsonDocument.RootElement;
        
        root.GetProperty("status").GetString().Should().Be("Degraded");
        root.GetProperty("totalDuration").GetString().Should().EndWith("ms");
        root.GetProperty("results").ValueKind.Should().Be(JsonValueKind.Array);
        root.GetProperty("results").GetArrayLength().Should().Be(1);
        
        var result = root.GetProperty("results")[0];
        result.GetProperty("name").GetString().Should().Be("TestCheck");
        result.GetProperty("status").GetString().Should().Be("Degraded");
        result.GetProperty("duration").GetString().Should().EndWith("ms");
        result.GetProperty("description").GetString().Should().Be("Test degraded check");
    }

    [Fact]
    public async Task WriteResponse_ReportWithData_IncludesDataInResponse() {
        // Arrange
        var context = CreateHttpContext();
        var data = new Dictionary<string, object> {
            ["connectionTime"] = "50ms",
            ["server"] = "localhost",
            ["database"] = "testdb"
        };
        var report = CreateHealthReport(HealthStatus.Healthy, "Test with data", TimeSpan.FromMilliseconds(100), data: data);

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        var responseBody = GetResponseBody(context);
        var jsonDocument = JsonDocument.Parse(responseBody);
        var result = jsonDocument.RootElement.GetProperty("results")[0];
        
        result.GetProperty("data").ValueKind.Should().Be(JsonValueKind.Object);
        var dataElement = result.GetProperty("data");
        dataElement.GetProperty("connectionTime").GetString().Should().Be("50ms");
        dataElement.GetProperty("server").GetString().Should().Be("localhost");
        dataElement.GetProperty("database").GetString().Should().Be("testdb");
    }

    [Fact]
    public async Task WriteResponse_ReportWithTags_IncludesTagsInResponse() {
        // Arrange
        var context = CreateHttpContext();
        var tags = new[] { "database", "critical" };
        var report = CreateHealthReport(HealthStatus.Healthy, "Test with tags", TimeSpan.FromMilliseconds(100), tags: tags);

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        var responseBody = GetResponseBody(context);
        var jsonDocument = JsonDocument.Parse(responseBody);
        var result = jsonDocument.RootElement.GetProperty("results")[0];
        
        result.GetProperty("tags").ValueKind.Should().Be(JsonValueKind.Array);
        result.GetProperty("tags").GetArrayLength().Should().Be(2);
        var tagsArray = result.GetProperty("tags");
        tagsArray[0].GetString().Should().Be("database");
        tagsArray[1].GetString().Should().Be("critical");
    }

    [Fact]
    public async Task WriteResponse_MultipleHealthChecks_WritesAllResults() {
        // Arrange
        var context = CreateHttpContext();
        var entries = new Dictionary<string, HealthReportEntry> {
            ["Database"] = CreateHealthReportEntry(HealthStatus.Healthy, "Database connection successful", TimeSpan.FromMilliseconds(75)),
            ["BlobStorage"] = CreateHealthReportEntry(HealthStatus.Degraded, "Container not found", TimeSpan.FromMilliseconds(125)),
            ["ExternalApi"] = CreateHealthReportEntry(HealthStatus.Unhealthy, "API timeout", TimeSpan.FromMilliseconds(5000), new TimeoutException("Request timeout"))
        };
        var report = new HealthReport(entries, TimeSpan.FromMilliseconds(300));

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        var responseBody = GetResponseBody(context);
        var jsonDocument = JsonDocument.Parse(responseBody);
        var root = jsonDocument.RootElement;
        
        root.GetProperty("status").GetString().Should().Be("Unhealthy"); // Worst status wins
        root.GetProperty("results").ValueKind.Should().Be(JsonValueKind.Array);
        root.GetProperty("results").GetArrayLength().Should().Be(3);
        
        var results = root.GetProperty("results");
        var dbResult = results.EnumerateArray().First(r => r.GetProperty("name").GetString() == "Database");
        dbResult.GetProperty("status").GetString().Should().Be("Healthy");
        
        var blobResult = results.EnumerateArray().First(r => r.GetProperty("name").GetString() == "BlobStorage");
        blobResult.GetProperty("status").GetString().Should().Be("Degraded");
        
        var apiResult = results.EnumerateArray().First(r => r.GetProperty("name").GetString() == "ExternalApi");
        apiResult.GetProperty("status").GetString().Should().Be("Unhealthy");
        apiResult.GetProperty("exception").GetString().Should().Be("Request timeout");
    }

    [Fact]
    public async Task WriteResponse_EmptyDataAndTags_ExcludesNullProperties() {
        // Arrange
        var context = CreateHttpContext();
        var report = CreateHealthReport(HealthStatus.Healthy, "Test without data/tags", TimeSpan.FromMilliseconds(100));

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        var responseBody = GetResponseBody(context);
        var jsonDocument = JsonDocument.Parse(responseBody);
        var result = jsonDocument.RootElement.GetProperty("results")[0];
        
        result.TryGetProperty("data", out _).Should().BeFalse();
        result.TryGetProperty("tags", out _).Should().BeFalse();
        result.TryGetProperty("exception", out _).Should().BeFalse();
    }

    [Fact]
    public async Task WriteResponse_ValidatesJsonSerialization_ProducesWellFormedJson() {
        // Arrange
        var context = CreateHttpContext();
        var data = new Dictionary<string, object> {
            ["special_chars"] = "Test with \"quotes\" and \n newlines",
            ["unicode"] = "Test with unicode: 🎲 ⚔️ 🐉",
            ["numbers"] = 42.5,
            ["boolean"] = true
        };
        var report = CreateHealthReport(HealthStatus.Healthy, "JSON validation test", TimeSpan.FromMilliseconds(100), data: data);

        // Act
        await DetailedHealthCheckResponseWriter.WriteResponse(context, report);

        // Assert
        var responseBody = GetResponseBody(context);
        
        // Should be able to parse without throwing
        var jsonDocument = JsonDocument.Parse(responseBody);
        var result = jsonDocument.RootElement.GetProperty("results")[0];
        var dataElement = result.GetProperty("data");
        
        dataElement.GetProperty("special_chars").GetString().Should().Contain("quotes");
        dataElement.GetProperty("unicode").GetString().Should().Contain("🎲");
        dataElement.GetProperty("numbers").GetDouble().Should().Be(42.5);
        dataElement.GetProperty("boolean").GetBoolean().Should().BeTrue();
    }

    private static HttpContext CreateHttpContext() {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static HealthReport CreateHealthReport(HealthStatus status, string description, TimeSpan duration, Exception? exception = null, Dictionary<string, object>? data = null, string[]? tags = null) {
        var entry = CreateHealthReportEntry(status, description, duration, exception, data, tags);
        var entries = new Dictionary<string, HealthReportEntry> { ["TestCheck"] = entry };
        return new HealthReport(entries, duration);
    }

    private static HealthReportEntry CreateHealthReportEntry(HealthStatus status, string description, TimeSpan duration, Exception? exception = null, Dictionary<string, object>? data = null, string[]? tags = null) {
        return new HealthReportEntry(
            status,
            description,
            duration,
            exception,
            data ?? new Dictionary<string, object>(),
            tags ?? Array.Empty<string>()
        );
    }

    private static string GetResponseBody(HttpContext context) {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body, Encoding.UTF8);
        return reader.ReadToEnd();
    }
}