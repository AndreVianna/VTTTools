namespace WebApi.DataStores;

/// <summary>
/// Defines the contract for storing and retrieving tenant and tenant token information.
/// </summary>
public interface ITenantDataStore
    : ITenantDataStore<Tenant>;

/// <summary>
/// Defines the contract for storing and retrieving tenant and tenant token information.
/// </summary>
/// <typeparam name="TTenant">The type of the tenant model.</typeparam>
public interface ITenantDataStore<TTenant>
    where TTenant : Tenant, new() {
    /// <summary>
    /// Checks if a tenant with the specified ID exists.
    /// </summary>
    /// <param name="id">The tenant ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the tenant exists, otherwise false.</returns>
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Finds a tenant by its ID.
    /// </summary>
    /// <param name="id">The tenant ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The tenant details or null if not found.</returns>
    ValueTask<TTenant?> FindByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Finds a tenant by the ID of a token associated with it.
    /// </summary>
    /// <param name="id">The token ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The tenant details or null if not found.</returns>
    ValueTask<TTenant?> FindByTokenIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Adds a new tenant or updates an existing one.
    /// </summary>
    /// <param name="tenant">The tenant details.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if a new tenant was added, false if an existing one was updated.</returns>
    Task<bool> AddOrUpdateAsync(TTenant tenant, CancellationToken ct = default);

    /// <summary>
    /// Deletes a tenant by its ID.
    /// </summary>
    /// <param name="id">The tenant ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the tenant was deleted, otherwise false.</returns>
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);

    // Access Token Methods
    /// <summary>
    /// Retrieves all active access tokens for a specific tenant.
    /// </summary>
    /// <param name="tenantId">The tenant ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A collection of access tokens.</returns>
    ValueTask<IEnumerable<AccessToken>> GetAccessTokensAsync(Guid tenantId, CancellationToken ct = default);

    /// <summary>
    /// Adds a new access token and its associated refresh token details for a tenant.
    /// </summary>
    /// <param name="tenantId">The tenant ID.</param>
    /// <param name="accessToken">The access token details.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the tokens were added successfully, otherwise false.</returns>
    Task<bool> AddAccessTokenAsync(Guid tenantId, AccessToken accessToken, CancellationToken ct = default);

    /// <summary>
    /// Removes a specific access token record by its composite key (TenantId, Number).
    /// </summary>
    /// <param name="id">The token ID.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the token record was removed, otherwise false.</returns>
    Task<bool> RemoveAccessTokenAsync(Guid id, CancellationToken ct = default);

    // Refresh Token Methods
    /// <summary>
    /// Finds access token details based on a token id.
    /// </summary>
    /// <param name="id">The token id to search for.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The token from the id.</returns>
    ValueTask<AccessToken?> FindTokenByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Invalidates a specific refresh token by its value (e.g., by nullifying it out).
    /// This prevents the token from being used again for refreshing.
    /// </summary>
    /// <param name="id">The id of the token value to cancel the refresh.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>True if the token was found and invalidated, otherwise false.</returns>
    Task<bool> InvalidateTokenAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Removes or invalidates all refresh tokens that have expired based on the current time.
    /// This is intended to be called periodically by a background job.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The number of expired refresh tokens removed or invalidated.</returns>
    Task<int> CleanExpiredTokensAsync(CancellationToken ct = default);
}