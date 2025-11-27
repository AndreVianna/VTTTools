namespace VttTools.Domain.Admin.Services;

public interface ILibraryAdminService {
    /// <summary>
    /// Retrieves the library configuration including available content types and their metadata.
    /// </summary>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The library configuration response containing content type definitions.</returns>
    Task<LibraryConfigResponse> GetConfigAsync(CancellationToken ct = default);

    /// <summary>
    /// Searches for worlds based on the specified criteria including filtering by name,
    /// owner, publication status, and visibility. Supports cursor-based pagination.
    /// </summary>
    /// <param name="request">The search criteria and pagination parameters.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A list of worlds matching the search criteria with hasMore indicator.</returns>
    Task<LibraryContentSearchResponse> SearchWorldsAsync(LibrarySearchRequest request, CancellationToken ct = default);

    /// <summary>
    /// Retrieves detailed information about a specific world by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the world.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The world's detailed information, or null if not found.</returns>
    Task<LibraryContentResponse?> GetWorldByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new world with the specified name and description.
    /// </summary>
    /// <param name="name">The name of the world.</param>
    /// <param name="description">The description of the world.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The created world information.</returns>
    Task<LibraryContentResponse> CreateWorldAsync(string name, string description, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing world with the specified properties. Only non-null values will be updated.
    /// </summary>
    /// <param name="id">The unique identifier of the world to update.</param>
    /// <param name="name">The new name for the world, or null to keep existing.</param>
    /// <param name="description">The new description for the world, or null to keep existing.</param>
    /// <param name="isPublished">The new publication status, or null to keep existing.</param>
    /// <param name="isPublic">The new visibility status, or null to keep existing.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The updated world information.</returns>
    Task<LibraryContentResponse> UpdateWorldAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);

    /// <summary>
    /// Deletes a world and all its associated content.
    /// </summary>
    /// <param name="id">The unique identifier of the world to delete.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task DeleteWorldAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Transfers ownership of a world to another user.
    /// </summary>
    /// <param name="id">The unique identifier of the world.</param>
    /// <param name="request">The ownership transfer request containing the new owner ID.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task TransferWorldOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    /// <summary>
    /// Searches for campaigns based on the specified criteria including filtering by name,
    /// owner, publication status, and visibility. Supports cursor-based pagination.
    /// </summary>
    /// <param name="request">The search criteria and pagination parameters.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A list of campaigns matching the search criteria with hasMore indicator.</returns>
    Task<LibraryContentSearchResponse> SearchCampaignsAsync(LibrarySearchRequest request, CancellationToken ct = default);

    /// <summary>
    /// Retrieves detailed information about a specific campaign by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the campaign.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The campaign's detailed information, or null if not found.</returns>
    Task<LibraryContentResponse?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new campaign with the specified name and description.
    /// </summary>
    /// <param name="name">The name of the campaign.</param>
    /// <param name="description">The description of the campaign.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The created campaign information.</returns>
    Task<LibraryContentResponse> CreateCampaignAsync(string name, string description, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing campaign with the specified properties. Only non-null values will be updated.
    /// </summary>
    /// <param name="id">The unique identifier of the campaign to update.</param>
    /// <param name="name">The new name for the campaign, or null to keep existing.</param>
    /// <param name="description">The new description for the campaign, or null to keep existing.</param>
    /// <param name="isPublished">The new publication status, or null to keep existing.</param>
    /// <param name="isPublic">The new visibility status, or null to keep existing.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The updated campaign information.</returns>
    Task<LibraryContentResponse> UpdateCampaignAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);

    /// <summary>
    /// Deletes a campaign and all its associated content.
    /// </summary>
    /// <param name="id">The unique identifier of the campaign to delete.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task DeleteCampaignAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Transfers ownership of a campaign to another user.
    /// </summary>
    /// <param name="id">The unique identifier of the campaign.</param>
    /// <param name="request">The ownership transfer request containing the new owner ID.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task TransferCampaignOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    /// <summary>
    /// Searches for adventures based on the specified criteria including filtering by name,
    /// owner, publication status, and visibility. Supports cursor-based pagination.
    /// </summary>
    /// <param name="request">The search criteria and pagination parameters.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A list of adventures matching the search criteria with hasMore indicator.</returns>
    Task<LibraryContentSearchResponse> SearchAdventuresAsync(LibrarySearchRequest request, CancellationToken ct = default);

    /// <summary>
    /// Retrieves detailed information about a specific adventure by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the adventure.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The adventure's detailed information, or null if not found.</returns>
    Task<LibraryContentResponse?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new adventure with the specified name and description.
    /// </summary>
    /// <param name="name">The name of the adventure.</param>
    /// <param name="description">The description of the adventure.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The created adventure information.</returns>
    Task<LibraryContentResponse> CreateAdventureAsync(string name, string description, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing adventure with the specified properties. Only non-null values will be updated.
    /// </summary>
    /// <param name="id">The unique identifier of the adventure to update.</param>
    /// <param name="name">The new name for the adventure, or null to keep existing.</param>
    /// <param name="description">The new description for the adventure, or null to keep existing.</param>
    /// <param name="isPublished">The new publication status, or null to keep existing.</param>
    /// <param name="isPublic">The new visibility status, or null to keep existing.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The updated adventure information.</returns>
    Task<LibraryContentResponse> UpdateAdventureAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);

    /// <summary>
    /// Deletes an adventure and all its associated content.
    /// </summary>
    /// <param name="id">The unique identifier of the adventure to delete.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task DeleteAdventureAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Transfers ownership of an adventure to another user.
    /// </summary>
    /// <param name="id">The unique identifier of the adventure.</param>
    /// <param name="request">The ownership transfer request containing the new owner ID.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task TransferAdventureOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    /// <summary>
    /// Searches for encounters based on the specified criteria including filtering by name,
    /// owner, and publication status. Supports cursor-based pagination.
    /// </summary>
    /// <param name="request">The search criteria and pagination parameters.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A list of encounters matching the search criteria with hasMore indicator.</returns>
    Task<LibraryContentSearchResponse> SearchEncountersAsync(LibrarySearchRequest request, CancellationToken ct = default);

    /// <summary>
    /// Retrieves detailed information about a specific encounter by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the encounter.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The encounter's detailed information, or null if not found.</returns>
    Task<LibraryContentResponse?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new encounter with the specified name and description.
    /// </summary>
    /// <param name="name">The name of the encounter.</param>
    /// <param name="description">The description of the encounter.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The created encounter information.</returns>
    Task<LibraryContentResponse> CreateEncounterAsync(string name, string description, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing encounter with the specified properties. Only non-null values will be updated.
    /// </summary>
    /// <param name="id">The unique identifier of the encounter to update.</param>
    /// <param name="name">The new name for the encounter, or null to keep existing.</param>
    /// <param name="description">The new description for the encounter, or null to keep existing.</param>
    /// <param name="isPublished">The new publication status, or null to keep existing.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The updated encounter information.</returns>
    Task<LibraryContentResponse> UpdateEncounterAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        CancellationToken ct = default);

    /// <summary>
    /// Deletes an encounter and all its associated content.
    /// </summary>
    /// <param name="id">The unique identifier of the encounter to delete.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task DeleteEncounterAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Transfers ownership of an encounter to another user.
    /// </summary>
    /// <param name="id">The unique identifier of the encounter.</param>
    /// <param name="request">The ownership transfer request containing the new owner ID.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task TransferEncounterOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);

    /// <summary>
    /// Searches for assets based on the specified criteria including filtering by name,
    /// owner, publication status, and visibility. Supports cursor-based pagination.
    /// </summary>
    /// <param name="request">The search criteria and pagination parameters.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>A list of assets matching the search criteria with hasMore indicator.</returns>
    Task<LibraryContentSearchResponse> SearchAssetsAsync(LibrarySearchRequest request, CancellationToken ct = default);

    /// <summary>
    /// Retrieves detailed information about a specific asset by its ID.
    /// </summary>
    /// <param name="id">The unique identifier of the asset.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The asset's detailed information, or null if not found.</returns>
    Task<LibraryContentResponse?> GetAssetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new asset with the specified name and description.
    /// </summary>
    /// <param name="name">The name of the asset.</param>
    /// <param name="description">The description of the asset.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The created asset information.</returns>
    Task<LibraryContentResponse> CreateAssetAsync(string name, string description, CancellationToken ct = default);

    /// <summary>
    /// Updates an existing asset with the specified properties. Only non-null values will be updated.
    /// </summary>
    /// <param name="id">The unique identifier of the asset to update.</param>
    /// <param name="name">The new name for the asset, or null to keep existing.</param>
    /// <param name="description">The new description for the asset, or null to keep existing.</param>
    /// <param name="isPublished">The new publication status, or null to keep existing.</param>
    /// <param name="isPublic">The new visibility status, or null to keep existing.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    /// <returns>The updated asset information.</returns>
    Task<LibraryContentResponse> UpdateAssetAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default);

    /// <summary>
    /// Deletes an asset and all its associated content.
    /// </summary>
    /// <param name="id">The unique identifier of the asset to delete.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task DeleteAssetAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Transfers ownership of an asset to another user.
    /// </summary>
    /// <param name="id">The unique identifier of the asset.</param>
    /// <param name="request">The ownership transfer request containing the new owner ID.</param>
    /// <param name="ct">Cancellation token for the operation.</param>
    Task TransferAssetOwnershipAsync(Guid id, TransferOwnershipRequest request, CancellationToken ct = default);
}
