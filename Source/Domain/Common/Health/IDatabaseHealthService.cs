namespace VttTools.Common.Health;

/// <summary>
/// Defines a contract for checking database connection health.
/// </summary>
public interface IDatabaseHealthService {
    /// <summary>
    /// Checks the health of the database connection.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The health status of the database connection.</returns>
    Task<ConnectionHealth> CheckConnectionAsync(CancellationToken ct = default);
}
