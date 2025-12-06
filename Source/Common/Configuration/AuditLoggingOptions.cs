namespace VttTools.Configuration;

public sealed class AuditLoggingOptions {
    public const string SectionName = "AuditLogging";

    public bool Enabled { get; init; } = true;
    public List<string> ExcludedPaths { get; init; } = [];
}