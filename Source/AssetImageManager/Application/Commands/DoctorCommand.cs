namespace VttTools.AssetImageManager.Application.Commands;

public sealed class DoctorCommand(IConfiguration configuration, IHttpClientFactory httpClientFactory, string outputDirectory) {
    public async Task<int> ExecuteAsync(DoctorOptions options, CancellationToken ct = default) {
        ConsoleOutput.WriteLine("AssetImageManager v2.0 - System Diagnostics");
        ConsoleOutput.WriteLine("=====================================");
        ConsoleOutput.WriteBlankLine();

        var checks = new List<IHealthCheck> {
            new ConfigurationHealthCheck(configuration),
            new FilesystemHealthCheck(outputDirectory)
        };

        var providers = configuration.GetSection("Providers").Get<Dictionary<string, object?>>() ?? [];
        if (!options.SkipApi) {
            foreach (var provider in providers.Keys) {
                checks.Add(new ProviderHealthCheck(provider, httpClientFactory, configuration));
            }
        }

        var results = new List<HealthCheckResult>();

        foreach (var group in checks.GroupBy(c => GetCheckCategory(c.Name))) {
            ConsoleOutput.WriteLine($"{group.Key} Checks");

            foreach (var check in group) {
                var result = await check.ExecuteAsync(ct);
                results.AddRange(result);

                var icon = ConsoleColorHelper.GetStatusIcon(result.Status);
                var color = ConsoleColorHelper.GetStatusColor(result.Status);

                ConsoleOutput.Write("  ");
                ConsoleOutput.Write(ConsoleColorHelper.Colorize(icon, color));
                ConsoleOutput.Write(" ");
                ConsoleOutput.Write(result.Message);
                ConsoleOutput.WriteBlankLine();

                if (!string.IsNullOrWhiteSpace(result.Details)) {
                    if (options.Verbose || result.Status is HealthCheckStatus.Warning or HealthCheckStatus.Fail) {
                        ConsoleOutput.WriteLine($"    {result.Details}");
                    }
                }

                if (result.Status is HealthCheckStatus.Warning or HealthCheckStatus.Fail) {
                    if (!string.IsNullOrWhiteSpace(result.Remediation)) {
                        ConsoleOutput.WriteLine($"    → {result.Remediation}");
                    }
                }
            }

            ConsoleOutput.WriteBlankLine();
        }

        var passCount = results.Count(r => r.Status == HealthCheckStatus.Pass);
        var warnCount = results.Count(r => r.Status == HealthCheckStatus.Warning);
        var failCount = results.Count(r => r.Status == HealthCheckStatus.Fail);
        var skipCount = results.Count(r => r.Status == HealthCheckStatus.Skipped);

        ConsoleOutput.WriteLine("=====================================");
        ConsoleOutput.WriteLine($"Summary: {passCount}/{results.Count - skipCount} checks passed");

        if (warnCount > 0) {
            ConsoleOutput.WriteLine($"  {ConsoleColorHelper.Colorize($"{warnCount} warning(s)", ConsoleColor.Yellow)}");
        }

        if (failCount > 0) {
            ConsoleOutput.WriteLine($"  {ConsoleColorHelper.Colorize($"{failCount} critical failure(s)", ConsoleColor.Red)}");
        }

        ConsoleOutput.WriteBlankLine();

        if (failCount == 0 && warnCount == 0) {
            ConsoleOutput.WriteLine(ConsoleColorHelper.Colorize("Status: READY - Your system is configured correctly!", ConsoleColor.Green));
            return 0;
        }

        if (failCount > 0) {
            ConsoleOutput.WriteLine(ConsoleColorHelper.Colorize("Status: CRITICAL - Please resolve failures before generating tokens.", ConsoleColor.Red));
            return 1;
        }

        ConsoleOutput.WriteLine(ConsoleColorHelper.Colorize("Status: DEGRADED - System will work but may have reduced performance.", ConsoleColor.Yellow));
        return 0;
    }

    private static string GetCheckCategory(string checkName) => checkName switch {
        "Configuration" => "Configuration",
        "Filesystem" => "Filesystem",
        _ when checkName.EndsWith(" API") => "API Connectivity",
        _ => "Other"
    };
}
