namespace VttTools.Common.Health;

/// <summary>
/// Represents the health status of a connection.
/// </summary>
public record ConnectionHealth {
    /// <summary>
    /// Gets whether the connection is healthy.
    /// </summary>
    public required bool IsHealthy { get; init; }

    /// <summary>
    /// Gets the connection time in milliseconds.
    /// </summary>
    public required long ConnectionTimeMs { get; init; }

    /// <summary>
    /// Gets the error message if the connection is unhealthy.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Gets additional diagnostic data.
    /// </summary>
    public IReadOnlyDictionary<string, object> Data { get; init; } = new Dictionary<string, object>();

    /// <summary>
    /// Creates a healthy connection result.
    /// </summary>
    public static ConnectionHealth Healthy(long connectionTimeMs, IReadOnlyDictionary<string, object>? data = null)
        => new() {
            IsHealthy = true,
            ConnectionTimeMs = connectionTimeMs,
            Data = data ?? new Dictionary<string, object>()
        };

    /// <summary>
    /// Creates an unhealthy connection result.
    /// </summary>
    public static ConnectionHealth Unhealthy(long connectionTimeMs, string errorMessage, IReadOnlyDictionary<string, object>? data = null)
        => new() {
            IsHealthy = false,
            ConnectionTimeMs = connectionTimeMs,
            ErrorMessage = errorMessage,
            Data = data ?? new Dictionary<string, object>()
        };
}
