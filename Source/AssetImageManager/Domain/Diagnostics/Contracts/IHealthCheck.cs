namespace VttTools.AssetImageManager.Domain.Diagnostics.Contracts;

public interface IHealthCheck {
    string Name { get; }
    HealthCheckCriticality Criticality { get; }
    Task<HealthCheckResult> ExecuteAsync(CancellationToken ct = default);
}
