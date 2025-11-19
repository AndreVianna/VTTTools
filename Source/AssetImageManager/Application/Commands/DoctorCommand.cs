namespace VttTools.AssetImageManager.Application.Commands;

public sealed class DoctorCommand(IConfiguration configuration, IHttpClientFactory httpClientFactory, string outputDirectory) {
    public async Task<int> ExecuteAsync(DoctorOptions options, CancellationToken ct = default) {
        Console.WriteLine("AssetImageManager v2.0 - System Diagnostics");
        Console.WriteLine("=====================================");
        Console.WriteLine();

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
            Console.WriteLine($"{group.Key} Checks");

            foreach (var check in group) {
                var result = await check.ExecuteAsync(ct);
                results.AddRange(result);

                var icon = ConsoleColorHelper.GetStatusIcon(result.Status);
                var color = ConsoleColorHelper.GetStatusColor(result.Status);

                Console.Write("  ");
                Console.Write(ConsoleColorHelper.Colorize(icon, color));
                Console.Write(" ");
                Console.Write(result.Message);
                Console.WriteLine();

                if (!string.IsNullOrWhiteSpace(result.Details)) {
                    if (options.Verbose || result.Status is HealthCheckStatus.Warning or HealthCheckStatus.Fail) {
                        Console.WriteLine($"    {result.Details}");
                    }
                }

                if (result.Status is HealthCheckStatus.Warning or HealthCheckStatus.Fail) {
                    if (!string.IsNullOrWhiteSpace(result.Remediation)) {
                        Console.WriteLine($"    → {result.Remediation}");
                    }
                }
            }

            Console.WriteLine();
        }

        var passCount = results.Count(r => r.Status == HealthCheckStatus.Pass);
        var warnCount = results.Count(r => r.Status == HealthCheckStatus.Warning);
        var failCount = results.Count(r => r.Status == HealthCheckStatus.Fail);
        var skipCount = results.Count(r => r.Status == HealthCheckStatus.Skipped);

        Console.WriteLine("=====================================");
        Console.WriteLine($"Summary: {passCount}/{results.Count - skipCount} checks passed");

        if (warnCount > 0) {
            Console.WriteLine($"  {ConsoleColorHelper.Colorize($"{warnCount} warning(s)", ConsoleColor.Yellow)}");
        }

        if (failCount > 0) {
            Console.WriteLine($"  {ConsoleColorHelper.Colorize($"{failCount} critical failure(s)", ConsoleColor.Red)}");
        }

        Console.WriteLine();

        if (failCount == 0 && warnCount == 0) {
            Console.WriteLine(ConsoleColorHelper.Colorize("Status: READY - Your system is configured correctly!", ConsoleColor.Green));
            return 0;
        }

        if (failCount > 0) {
            Console.WriteLine(ConsoleColorHelper.Colorize("Status: CRITICAL - Please resolve failures before generating tokens.", ConsoleColor.Red));
            return 1;
        }

        Console.WriteLine(ConsoleColorHelper.Colorize("Status: DEGRADED - System will work but may have reduced performance.", ConsoleColor.Yellow));
        return 0;
    }

    private static string GetCheckCategory(string checkName) => checkName switch {
        "Configuration" => "Configuration",
        "Filesystem" => "Filesystem",
        _ when checkName.EndsWith(" API") => "API Connectivity",
        _ => "Other"
    };
}
