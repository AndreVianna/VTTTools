using EncounterModel = VttTools.Library.Encounters.Model.Encounter;

namespace VttTools.Admin.Library.Services;

public sealed class EncounterAdminService(
    IOptions<PublicLibraryOptions> options,
    IEncounterStorage encounterStorage,
    IAdventureStorage adventureStorage,
    UserManager<User> userManager,
    ILogger<EncounterAdminService> logger)
    : LibraryAdminService(options, userManager, logger),
      IEncounterAdminService {

    public async Task<LibraryContentSearchResponse> SearchEncountersAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            (var skip, var take) = GetPagination(request);
            var filter = new LibrarySearchFilter {
                Search = request.Search,
                OwnerId = request.OwnerId,
                OwnerType = request.OwnerType,
                IsPublished = request.IsPublished,
                IsPublic = request.IsPublic,
                SortBy = request.SortBy,
                SortOrder = request.SortOrder,
                Skip = skip,
                Take = take + 1,
            };

            (var encounters, var totalCount) = await encounterStorage.SearchAsync(MasterUserId, filter, ct);

            var hasMore = encounters.Length > take;
            if (hasMore)
                encounters = [.. encounters.Take(take)];

            var owners = await GetOwnerDictionaryAsync(encounters.Select(e => e.Adventure.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var encounter in encounters) {
                var ownerName = owners.GetValueOrDefault(encounter.Adventure.OwnerId);
                content.Add(MapToContentResponse(encounter, ownerName));
            }

            Logger.LogInformation(
                "Encounter search completed: {Count} encounters found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new() {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore,
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching encounters");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var encounter = await encounterStorage.GetByIdAsync(id, ct);
            if (encounter is null)
                return null;

            var ownerName = await GetOwnerNameAsync(encounter.Adventure.OwnerId);
            return MapToContentResponse(encounter, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateEncounterAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);

            var filter = new LibrarySearchFilter {
                OwnerId = MasterUserId,
                SortBy = "name",
                SortOrder = "asc",
                Skip = 0,
                Take = 1,
            };
            (var adventures, _) = await adventureStorage.SearchAsync(MasterUserId, filter, ct);
            var defaultAdventure = adventures.FirstOrDefault()
                ?? throw new InvalidOperationException("No default adventure found for master user");

            var encounter = new EncounterModel {
                Id = Guid.CreateVersion7(),
                Adventure = defaultAdventure,
                Name = name,
                Description = description,
                IsPublished = false,
            };

            await encounterStorage.AddAsync(encounter, defaultAdventure.Id, ct);

            Logger.LogInformation("Created encounter {EncounterId} with name '{Name}'", encounter.Id, encounter.Name);

            var ownerName = await GetOwnerNameAsync(defaultAdventure.OwnerId);
            return MapToContentResponse(encounter, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating encounter with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateEncounterAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var encounter = await encounterStorage.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Encounter with ID {id} not found");

            var updatedEncounter = encounter with {
                Name = name ?? encounter.Name,
                Description = description ?? encounter.Description,
                IsPublished = isPublished ?? encounter.IsPublished,
                IsPublic = isPublic ?? encounter.IsPublic,
            };

            await encounterStorage.UpdateAsync(updatedEncounter, ct);

            Logger.LogInformation("Updated encounter {EncounterId}", id);

            var ownerName = await GetOwnerNameAsync(updatedEncounter.Adventure.OwnerId);
            return MapToContentResponse(updatedEncounter, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task DeleteEncounterAsync(Guid id, CancellationToken ct = default) {
        try {
            var deleted = await encounterStorage.DeleteAsync(id, ct);
            if (!deleted) {
                Logger.LogWarning("Attempted to delete non-existent encounter {EncounterId}", id);
                return;
            }

            Logger.LogInformation("Deleted encounter {EncounterId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task TransferEncounterOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var encounter = await encounterStorage.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Encounter with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new ArgumentException("TargetUserId is required for 'grant' action"),
                _ => throw new ArgumentException($"Invalid action: {request.Action}"),
            };

            var updatedAdventure = encounter.Adventure with { OwnerId = newOwnerId };
            await adventureStorage.UpdateAsync(updatedAdventure, ct);

            Logger.LogInformation(
                "Transferred encounter {EncounterId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of encounter {EncounterId}", id);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(EncounterModel encounter, string? ownerName)
        => new() {
            Id = encounter.Id,
            OwnerId = encounter.OwnerId,
            OwnerName = ownerName,
            Name = encounter.Name ?? encounter.Stage.Name,
            Description = encounter.Description ?? encounter.Stage.Description,
            IsPublished = encounter.IsPublished,
            IsPublic = false,
        };
}
