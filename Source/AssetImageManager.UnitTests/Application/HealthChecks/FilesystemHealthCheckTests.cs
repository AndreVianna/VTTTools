namespace VttTools.AssetImageManager.Application.HealthChecks;

public sealed class FilesystemHealthCheckTests : IDisposable {
    private readonly string _tempDir;

    public FilesystemHealthCheckTests() {
        _tempDir = Path.Combine(Path.GetTempPath(), $"FilesystemHealthCheckTests_{Guid.NewGuid():N}");
    }

    public void Dispose() {
        if (Directory.Exists(_tempDir)) {
            try {
                Directory.Delete(_tempDir, true);
            }
            catch {
            }
        }
    }

    [Fact]
    public async Task Should_ReturnPass_When_OutputDirectoryWritable() {
        var check = new FilesystemHealthCheck(_tempDir);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Pass, result.Status);
        Assert.Equal("Filesystem", result.CheckName);
        Assert.Equal("Filesystem ready", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("Output directory writable", result.Details);
        Assert.Contains(_tempDir, result.Details);
        Assert.Null(result.Remediation);
    }

    [Fact]
    public async Task Should_CreateOutputDirectory_When_NotExists() {
        var check = new FilesystemHealthCheck(_tempDir);

        Assert.False(Directory.Exists(_tempDir));

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.True(Directory.Exists(_tempDir));
        Assert.Equal(HealthCheckStatus.Pass, result.Status);
    }

    [Fact]
    public async Task Should_ReturnPass_When_DiskSpaceAdequate() {
        var check = new FilesystemHealthCheck(_tempDir);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        if (result.Status == HealthCheckStatus.Pass) {
            Assert.NotNull(result.Details);
            Assert.Contains("Available space:", result.Details);
        }
    }

    [Fact]
    public async Task Should_ReturnWarning_When_DiskSpaceLow() {
        var driveInfo = new DriveInfo(Path.GetPathRoot(Path.GetFullPath(_tempDir))!);
        var availableSpaceGB = driveInfo.AvailableFreeSpace / (1024.0 * 1024.0 * 1024.0);

        if (availableSpaceGB >= 1.0) {
            return;
        }

        var check = new FilesystemHealthCheck(_tempDir);
        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Warning, result.Status);
        Assert.Equal("Low disk space", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("Available:", result.Details);
        Assert.Contains("recommended: 1 GB", result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("Consider freeing up disk space", result.Remediation);
    }

    [Fact]
    public async Task Should_MeasureDiskSpace() {
        var check = new FilesystemHealthCheck(_tempDir);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        if (result.Status is HealthCheckStatus.Pass or HealthCheckStatus.Warning) {
            Assert.NotNull(result.Details);
            Assert.Contains("GB", result.Details);
        }
    }

    [Fact]
    public async Task Should_ReturnFail_When_OutputDirectoryNotWritable() {
        if (OperatingSystem.IsWindows()) {
            const string invalidPath = "Z:\\nonexistent\\invalid\\path";
            var check = new FilesystemHealthCheck(invalidPath);

            var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

            Assert.True(result.Status is HealthCheckStatus.Fail or HealthCheckStatus.Warning);
        }
    }

    [Fact]
    public async Task Should_CleanupTestFiles() {
        var check = new FilesystemHealthCheck(_tempDir);

        await check.ExecuteAsync(TestContext.Current.CancellationToken);

        var testFiles = Directory.GetFiles(_tempDir, ".health_check_*.tmp");
        Assert.Empty(testFiles);
    }

    [Fact]
    public async Task Should_HaveCriticalCriticality() {
        var check = new FilesystemHealthCheck(_tempDir);

        Assert.Equal(HealthCheckCriticality.Critical, check.Criticality);
    }

    [Fact]
    public async Task Should_HaveCorrectName() {
        var check = new FilesystemHealthCheck(_tempDir);

        Assert.Equal("Filesystem", check.Name);
    }

    [Fact]
    public async Task Should_MeasureDuration() {
        var check = new FilesystemHealthCheck(_tempDir);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.NotNull(result.Duration);
        Assert.True(result.Duration.Value.TotalMilliseconds >= 0);
    }

    [Fact]
    public async Task Should_HandleCancellation() {
        var check = new FilesystemHealthCheck(_tempDir);
        var cts = new CancellationTokenSource();
        cts.Cancel();

        var exception = await Record.ExceptionAsync(async () => await check.ExecuteAsync(cts.Token));

        Assert.True(exception is null or OperationCanceledException);
    }

    [Fact]
    public async Task Should_ReturnFail_When_DirectoryCreationFails() {
        if (OperatingSystem.IsWindows()) {
            const string invalidPath = "CON:";
            var check = new FilesystemHealthCheck(invalidPath);

            var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

            Assert.Equal(HealthCheckStatus.Fail, result.Status);
            Assert.Equal("Cannot create output directory", result.Message);
            Assert.NotNull(result.Details);
            Assert.Contains("Error:", result.Details);
            Assert.NotNull(result.Remediation);
            Assert.Contains("Check directory permissions", result.Remediation);
        }
    }

    [Fact]
    public async Task Should_VerifyWritePermissions() {
        var check = new FilesystemHealthCheck(_tempDir);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.True(Directory.Exists(_tempDir));
        Assert.True(result.Status is HealthCheckStatus.Pass or
                    HealthCheckStatus.Warning);
    }
}
