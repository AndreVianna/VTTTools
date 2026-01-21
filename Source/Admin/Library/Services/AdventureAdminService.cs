using AdventureModel = VttTools.Library.Adventures.Model.Adventure;
using EncounterModel = VttTools.Library.Encounters.Model.Encounter;

namespace VttTools.Admin.Library.Services;

public sealed class AdventureAdminService(
    IOptions<PublicLibraryOptions> options,
    IAdventureStorage adventureStorage,
    IEncounterStorage encounterStorage,
    IUserStorage userStorage,
    ILogger<AdventureAdminService> logger)
    : LibraryAdminService(options, userStorage, logger), IAdventureAdminService {

    public async Task<LibraryContentSearchResponse> SearchAdventuresAsync(
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

            (var adventures, var totalCount) = await adventureStorage.SearchAsync(MasterUserId, filter, ct);

            var hasMore = adventures.Length > take;
            if (hasMore)
                adventures = [.. adventures.Take(take)];

            var owners = await GetOwnerDictionaryAsync(adventures.Select(a => a.OwnerId), ct);

            var content = new List<LibraryContentResponse>();
            foreach (var adventure in adventures) {
                var ownerName = owners.GetValueOrDefault(adventure.OwnerId);
                content.Add(MapToContentResponse(adventure, ownerName));
            }

            Logger.LogInformation(
                "Adventure search completed: {Count} adventures found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new() {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore,
            };
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error searching adventures");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var adventure = await adventureStorage.GetByIdAsync(id, ct);
            if (adventure is null)
                return null;
            var ownerName = await GetOwnerNameAsync(adventure.OwnerId);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateAdventureAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);

            var adventure = new AdventureModel {
                Id = Guid.CreateVersion7(),
                OwnerId = MasterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false,
            };

            await adventureStorage.AddAsync(adventure, ct);

            Logger.LogInformation("Created adventure {AdventureId} with name '{Name}'", adventure.Id, adventure.Name);

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating adventure with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateAdventureAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var adventure = await adventureStorage.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Adventure with ID {id} not found");

            var updatedAdventure = adventure with {
                Name = name ?? adventure.Name,
                Description = description ?? adventure.Description,
                IsPublished = isPublished ?? adventure.IsPublished,
                IsPublic = isPublic ?? adventure.IsPublic
            };

            await adventureStorage.UpdateAsync(updatedAdventure, ct);

            Logger.LogInformation("Updated adventure {AdventureId}", id);

            var ownerName = await GetOwnerNameAsync(updatedAdventure.OwnerId);
            return MapToContentResponse(updatedAdventure, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error updating adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task DeleteAdventureAsync(Guid id, CancellationToken ct = default) {
        try {
            var deleted = await adventureStorage.DeleteAsync(id, ct);
            if (!deleted) {
                Logger.LogWarning("Attempted to delete non-existent adventure {AdventureId}", id);
                return;
            }

            Logger.LogInformation("Deleted adventure {AdventureId}", id);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error deleting adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task TransferAdventureOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var adventure = await adventureStorage.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Adventure with ID {id} not found");

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => MasterUserId,
                "grant" => request.TargetUserId ?? throw new ArgumentException("TargetUserId is required for 'grant' action"),
                _ => throw new ArgumentException($"Invalid action: {request.Action}")
            };

            var updatedAdventure = adventure with { OwnerId = newOwnerId };
            await adventureStorage.UpdateAsync(updatedAdventure, ct);

            Logger.LogInformation(
                "Transferred adventure {AdventureId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error transferring ownership of adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task<IReadOnlyList<LibraryContentResponse>> GetEncountersByAdventureIdAsync(
        Guid adventureId,
        CancellationToken ct = default) {
        try {
            var encounters = await encounterStorage.GetByParentIdAsync(adventureId, ct);

            var owners = await GetOwnerDictionaryAsync(encounters.Select(a => a.OwnerId), ct);

            var result = new List<LibraryContentResponse>();
            foreach (var encounter in encounters) {
                var ownerName = owners.GetValueOrDefault(encounter.OwnerId);
                result.Add(MapEncounterToContentResponse(encounter, ownerName));
            }

            Logger.LogInformation("Retrieved {Count} encounters for adventure {AdventureId}", result.Count, adventureId);
            return result.AsReadOnly();
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error retrieving encounters for adventure {AdventureId}", adventureId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateEncounterForAdventureAsync(
        Guid adventureId,
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);

            var adventure = await adventureStorage.GetByIdAsync(adventureId, ct)
                ?? throw new KeyNotFoundException($"Adventure with ID {adventureId} not found");

            var encounter = new EncounterModel {
                Id = Guid.CreateVersion7(),
                OwnerId = MasterUserId,
                Adventure = adventure,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false,
            };

            await encounterStorage.AddAsync(encounter, adventureId, ct);

            Logger.LogInformation("Created encounter {EncounterId} '{Name}' for adventure {AdventureId}", encounter.Id, name, adventureId);

            var ownerName = await GetOwnerNameAsync(encounter.OwnerId);
            return MapEncounterToContentResponse(encounter, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error creating encounter for adventure {AdventureId}", adventureId);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CloneEncounterAsync(
        Guid adventureId,
        Guid encounterId,
        string? newName,
        CancellationToken ct = default) {
        try {
            var encounter = await encounterStorage.GetByIdAsync(encounterId, ct)
                ?? throw new KeyNotFoundException($"Encounter {encounterId} not found");

            if (encounter.Adventure.Id != adventureId)
                throw new KeyNotFoundException($"Encounter {encounterId} not found in adventure {adventureId}");

            var clonedEncounter = encounter with {
                Id = Guid.CreateVersion7(),
                Name = newName ?? $"{encounter.Name} (Copy)",
                IsPublished = false,
                IsPublic = false,
            };

            await encounterStorage.AddAsync(clonedEncounter, adventureId, ct);

            Logger.LogInformation("Cloned encounter {EncounterId} to {ClonedId} for adventure {AdventureId}", encounterId, clonedEncounter.Id, adventureId);

            var ownerName = await GetOwnerNameAsync(clonedEncounter.OwnerId);
            return MapEncounterToContentResponse(clonedEncounter, ownerName);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error cloning encounter {EncounterId} in adventure {AdventureId}", encounterId, adventureId);
            throw;
        }
    }

    public async Task RemoveEncounterFromAdventureAsync(
        Guid adventureId,
        Guid encounterId,
        CancellationToken ct = default) {
        try {
            var encounter = await encounterStorage.GetByIdAsync(encounterId, ct)
                ?? throw new KeyNotFoundException($"Encounter {encounterId} not found");

            if (encounter.Adventure.Id != adventureId)
                throw new KeyNotFoundException($"Encounter {encounterId} not found in adventure {adventureId}");

            await encounterStorage.DeleteAsync(encounterId, ct);

            Logger.LogInformation("Removed encounter {EncounterId} from adventure {AdventureId}", encounterId, adventureId);
        }
        catch (Exception ex) {
            Logger.LogError(ex, "Error removing encounter {EncounterId} from adventure {AdventureId}", encounterId, adventureId);
            throw;
        }
    }

    private static LibraryContentResponse MapToContentResponse(AdventureModel adventure, string? ownerName)
        => new() {
            Id = adventure.Id,
            OwnerId = adventure.OwnerId,
            OwnerName = ownerName,
            Name = adventure.Name,
            Description = adventure.Description,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
        };

    private static LibraryContentResponse MapEncounterToContentResponse(EncounterModel encounter, string? ownerName)
        => new() {
            Id = encounter.Id,
            OwnerId = encounter.OwnerId,
            OwnerName = ownerName,
            Name = encounter.Name ?? encounter.Stage.Name,
            Description = encounter.Description ?? encounter.Stage.Description,
            IsPublished = encounter.IsPublished,
            IsPublic = encounter.IsPublic,
        };
}