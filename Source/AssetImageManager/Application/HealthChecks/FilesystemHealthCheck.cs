namespace VttTools.AssetImageManager.Application.HealthChecks;

public sealed class FilesystemHealthCheck(string outputDirectory) : IHealthCheck {
    public string Name => "Filesystem";
    public HealthCheckCriticality Criticality => HealthCheckCriticality.Critical;

    public async Task<HealthCheckResult> ExecuteAsync(CancellationToken ct = default) {
        var sw = Stopwatch.StartNew();
        await Task.CompletedTask;

        try {
            Directory.CreateDirectory(outputDirectory);
        }
        catch (Exception ex) {
            return new HealthCheckResult(
                Name,
                HealthCheckStatus.Fail,
                "Cannot create output directory",
                $"Path: {outputDirectory}, Error: {ex.Message}",
                "Check directory permissions and path validity",
                sw.Elapsed
            );
        }

        var testFile = Path.Combine(outputDirectory, $".health_check_{Guid.NewGuid():N}.tmp");
        try {
            await File.WriteAllTextAsync(testFile, "test", ct);
            File.Delete(testFile);
        }
        catch (Exception ex) {
            return new HealthCheckResult(
                Name,
                HealthCheckStatus.Fail,
                "Output directory not writable",
                $"Path: {outputDirectory}, Error: {ex.Message}",
                "Check directory write permissions",
                sw.Elapsed
            );
        }

        if (OperatingSystem.IsWindows()) {
            try {
                using var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\FileSystem");
                var longPathsEnabled = key?.GetValue("LongPathsEnabled") as int?;

                if (longPathsEnabled != 1) {
                    return new HealthCheckResult(
                        Name,
                        HealthCheckStatus.Warning,
                        "Windows long path support not enabled",
                        "LongPathsEnabled registry value is not set to 1",
                        "Enable long paths: Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem' -Name 'LongPathsEnabled' -Value 1",
                        sw.Elapsed
                    );
                }
            }
            catch {
            }
        }

        try {
            var drive = new DriveInfo(Path.GetPathRoot(Path.GetFullPath(outputDirectory))!);
            var availableSpaceGB = drive.AvailableFreeSpace / (1024.0 * 1024.0 * 1024.0);

            return availableSpaceGB < 0.1
                ? new HealthCheckResult(
                    Name,
                    HealthCheckStatus.Fail,
                    "Insufficient disk space",
                    $"Available: {availableSpaceGB:F2} GB (minimum: 0.1 GB)",
                    "Free up disk space before generating tokens",
                    sw.Elapsed
                )
                : availableSpaceGB < 1.0
                ? new HealthCheckResult(
                    Name,
                    HealthCheckStatus.Warning,
                    "Low disk space",
                    $"Available: {availableSpaceGB:F2} GB (recommended: 1 GB)",
                    "Consider freeing up disk space",
                    sw.Elapsed
                )
                : new HealthCheckResult(
                Name,
                HealthCheckStatus.Pass,
                "Filesystem ready",
                $"Output directory writable: {outputDirectory}, Available space: {availableSpaceGB:F2} GB",
                null,
                sw.Elapsed
            );
        }
        catch (Exception ex) {
            return new HealthCheckResult(
                Name,
                HealthCheckStatus.Warning,
                "Could not check disk space",
                ex.Message,
                null,
                sw.Elapsed
            );
        }
    }
}
