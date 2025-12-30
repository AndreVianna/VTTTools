namespace VttTools.Common.Health;

/// <summary>
/// Defines a contract for checking blob storage connection health.
/// </summary>
public interface IBlobStorageHealthService {
    /// <summary>
    /// Checks the health of the blob storage connection.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The health status of the blob storage connection.</returns>
    Task<ConnectionHealth> CheckConnectionAsync(CancellationToken ct = default);
}
