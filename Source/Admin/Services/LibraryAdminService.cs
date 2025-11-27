using Microsoft.Extensions.Options;
using VttTools.Configuration;
using VttTools.Data;
using VttTools.Domain.Admin.ApiContracts.Library;
using VttTools.Domain.Admin.Services;
using VttTools.Identity.Model;
using Asset = VttTools.Data.Assets.Entities.Asset;
using Adventure = VttTools.Data.Library.Entities.Adventure;
using Campaign = VttTools.Data.Library.Entities.Campaign;
using Encounter = VttTools.Data.Library.Entities.Encounter;
using World = VttTools.Data.Library.Entities.World;

namespace VttTools.Admin.Services;

public sealed class LibraryAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger<LibraryAdminService> logger) : ILibraryAdminService {

    private readonly Guid _masterUserId = options.Value.MasterUserId;

    public Task<LibraryConfigResponse> GetConfigAsync(CancellationToken ct = default) {
        try {
            logger.LogInformation("Retrieving library configuration");

            return Task.FromResult(new LibraryConfigResponse {
                MasterUserId = _masterUserId
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving library configuration");
            throw;
        }
    }

    public async Task<LibraryContentSearchResponse> SearchWorldsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = dbContext.Worlds.AsQueryable();

            query = ApplySearchFilters(query, request);

            var totalCount = await query.CountAsync(ct);

            var skip = request.Skip ?? 0;
            var take = request.Take ?? 20;

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            query = sortBy switch {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(w => w.Name)
                    : query.OrderBy(w => w.Name),
                _ => sortOrder == "desc"
                    ? query.OrderByDescending(w => w.Name)
                    : query.OrderBy(w => w.Name)
            };

            var worlds = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = worlds.Count > take;
            if (hasMore) {
                worlds = [.. worlds.Take(take)];
            }

            var ownerIds = worlds.Select(w => w.OwnerId).Distinct().ToList();
            var owners = await userManager.Users
                .Where(u => ownerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);

            var content = new List<LibraryContentResponse>();
            foreach (var world in worlds) {
                var ownerName = owners.GetValueOrDefault(world.OwnerId);
                content.Add(MapToContentResponse(world, ownerName));
            }

            logger.LogInformation(
                "World search completed: {Count} worlds found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error searching worlds");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetWorldByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var world = await dbContext.Worlds.FindAsync([id], ct);
            if (world is null) {
                return null;
            }

            var ownerName = await GetOwnerNameAsync(world.OwnerId, ct);
            return MapToContentResponse(world, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving world {WorldId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateWorldAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException("Name cannot be empty", nameof(name));
            }

            var world = new World {
                OwnerId = _masterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            dbContext.Worlds.Add(world);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Created world {WorldId} with name '{Name}'", world.Id, world.Name);

            var ownerName = await GetOwnerNameAsync(world.OwnerId, ct);
            return MapToContentResponse(world, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating world with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateWorldAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var world = await dbContext.Worlds.FindAsync([id], ct);
            if (world is null) {
                throw new InvalidOperationException($"World with ID {id} not found");
            }

            if (name is not null) {
                world.Name = name;
            }

            if (description is not null) {
                world.Description = description;
            }

            if (isPublished.HasValue) {
                world.IsPublished = isPublished.Value;
            }

            if (isPublic.HasValue) {
                world.IsPublic = isPublic.Value;
            }

            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Updated world {WorldId}", id);

            var ownerName = await GetOwnerNameAsync(world.OwnerId, ct);
            return MapToContentResponse(world, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating world {WorldId}", id);
            throw;
        }
    }

    public async Task DeleteWorldAsync(Guid id, CancellationToken ct = default) {
        try {
            var world = await dbContext.Worlds.FindAsync([id], ct);
            if (world is null) {
                logger.LogWarning("Attempted to delete non-existent world {WorldId}", id);
                return;
            }

            dbContext.Worlds.Remove(world);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Deleted world {WorldId}", id);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting world {WorldId}", id);
            throw;
        }
    }

    public async Task TransferWorldOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var world = await dbContext.Worlds.FindAsync([id], ct);
            if (world is null) {
                throw new InvalidOperationException($"World with ID {id} not found");
            }

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => _masterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            world.OwnerId = newOwnerId;
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation(
                "Transferred world {WorldId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error transferring ownership of world {WorldId}", id);
            throw;
        }
    }

    public async Task<LibraryContentSearchResponse> SearchCampaignsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = dbContext.Campaigns.AsQueryable();

            query = ApplySearchFilters(query, request);

            var totalCount = await query.CountAsync(ct);

            var skip = request.Skip ?? 0;
            var take = request.Take ?? 20;

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            query = sortBy switch {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name),
                _ => sortOrder == "desc"
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name)
            };

            var campaigns = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = campaigns.Count > take;
            if (hasMore) {
                campaigns = [.. campaigns.Take(take)];
            }

            var ownerIds = campaigns.Select(c => c.OwnerId).Distinct().ToList();
            var owners = await userManager.Users
                .Where(u => ownerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);

            var content = new List<LibraryContentResponse>();
            foreach (var campaign in campaigns) {
                var ownerName = owners.GetValueOrDefault(campaign.OwnerId);
                content.Add(MapToContentResponse(campaign, ownerName));
            }

            logger.LogInformation(
                "Campaign search completed: {Count} campaigns found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error searching campaigns");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetCampaignByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var campaign = await dbContext.Campaigns.FindAsync([id], ct);
            if (campaign is null) {
                return null;
            }

            var ownerName = await GetOwnerNameAsync(campaign.OwnerId, ct);
            return MapToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateCampaignAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException("Name cannot be empty", nameof(name));
            }

            var campaign = new Campaign {
                OwnerId = _masterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            dbContext.Campaigns.Add(campaign);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Created campaign {CampaignId} with name '{Name}'", campaign.Id, campaign.Name);

            var ownerName = await GetOwnerNameAsync(campaign.OwnerId, ct);
            return MapToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating campaign with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateCampaignAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var campaign = await dbContext.Campaigns.FindAsync([id], ct);
            if (campaign is null) {
                throw new InvalidOperationException($"Campaign with ID {id} not found");
            }

            if (name is not null) {
                campaign.Name = name;
            }

            if (description is not null) {
                campaign.Description = description;
            }

            if (isPublished.HasValue) {
                campaign.IsPublished = isPublished.Value;
            }

            if (isPublic.HasValue) {
                campaign.IsPublic = isPublic.Value;
            }

            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Updated campaign {CampaignId}", id);

            var ownerName = await GetOwnerNameAsync(campaign.OwnerId, ct);
            return MapToContentResponse(campaign, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task DeleteCampaignAsync(Guid id, CancellationToken ct = default) {
        try {
            var campaign = await dbContext.Campaigns.FindAsync([id], ct);
            if (campaign is null) {
                logger.LogWarning("Attempted to delete non-existent campaign {CampaignId}", id);
                return;
            }

            dbContext.Campaigns.Remove(campaign);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Deleted campaign {CampaignId}", id);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task TransferCampaignOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var campaign = await dbContext.Campaigns.FindAsync([id], ct);
            if (campaign is null) {
                throw new InvalidOperationException($"Campaign with ID {id} not found");
            }

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => _masterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            campaign.OwnerId = newOwnerId;
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation(
                "Transferred campaign {CampaignId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error transferring ownership of campaign {CampaignId}", id);
            throw;
        }
    }

    public async Task<LibraryContentSearchResponse> SearchAdventuresAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = dbContext.Adventures.AsQueryable();

            query = ApplySearchFilters(query, request);

            var totalCount = await query.CountAsync(ct);

            var skip = request.Skip ?? 0;
            var take = request.Take ?? 20;

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            query = sortBy switch {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(a => a.Name)
                    : query.OrderBy(a => a.Name),
                _ => sortOrder == "desc"
                    ? query.OrderByDescending(a => a.Name)
                    : query.OrderBy(a => a.Name)
            };

            var adventures = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = adventures.Count > take;
            if (hasMore) {
                adventures = [.. adventures.Take(take)];
            }

            var ownerIds = adventures.Select(a => a.OwnerId).Distinct().ToList();
            var owners = await userManager.Users
                .Where(u => ownerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);

            var content = new List<LibraryContentResponse>();
            foreach (var adventure in adventures) {
                var ownerName = owners.GetValueOrDefault(adventure.OwnerId);
                content.Add(MapToContentResponse(adventure, ownerName));
            }

            logger.LogInformation(
                "Adventure search completed: {Count} adventures found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error searching adventures");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var adventure = await dbContext.Adventures.FindAsync([id], ct);
            if (adventure is null) {
                return null;
            }

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId, ct);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateAdventureAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException("Name cannot be empty", nameof(name));
            }

            var adventure = new Adventure {
                OwnerId = _masterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            dbContext.Adventures.Add(adventure);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Created adventure {AdventureId} with name '{Name}'", adventure.Id, adventure.Name);

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId, ct);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating adventure with name '{Name}'", name);
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
            var adventure = await dbContext.Adventures.FindAsync([id], ct);
            if (adventure is null) {
                throw new InvalidOperationException($"Adventure with ID {id} not found");
            }

            if (name is not null) {
                adventure.Name = name;
            }

            if (description is not null) {
                adventure.Description = description;
            }

            if (isPublished.HasValue) {
                adventure.IsPublished = isPublished.Value;
            }

            if (isPublic.HasValue) {
                adventure.IsPublic = isPublic.Value;
            }

            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Updated adventure {AdventureId}", id);

            var ownerName = await GetOwnerNameAsync(adventure.OwnerId, ct);
            return MapToContentResponse(adventure, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task DeleteAdventureAsync(Guid id, CancellationToken ct = default) {
        try {
            var adventure = await dbContext.Adventures.FindAsync([id], ct);
            if (adventure is null) {
                logger.LogWarning("Attempted to delete non-existent adventure {AdventureId}", id);
                return;
            }

            dbContext.Adventures.Remove(adventure);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Deleted adventure {AdventureId}", id);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task TransferAdventureOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var adventure = await dbContext.Adventures.FindAsync([id], ct);
            if (adventure is null) {
                throw new InvalidOperationException($"Adventure with ID {id} not found");
            }

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => _masterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            adventure.OwnerId = newOwnerId;
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation(
                "Transferred adventure {AdventureId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error transferring ownership of adventure {AdventureId}", id);
            throw;
        }
    }

    public async Task<LibraryContentSearchResponse> SearchEncountersAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = dbContext.Encounters
                .Include(e => e.Adventure)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search)) {
                var searchTerm = request.Search.Trim().ToLowerInvariant();
                query = query.Where(e =>
                    e.Name.ToLower().Contains(searchTerm) ||
                    e.Description.ToLower().Contains(searchTerm));
            }

            if (request.OwnerId.HasValue) {
                query = query.Where(e => e.Adventure.OwnerId == request.OwnerId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.OwnerType)) {
                var ownerType = request.OwnerType.ToLowerInvariant();
                query = ownerType switch {
                    "master" => query.Where(e => e.Adventure.OwnerId == _masterUserId),
                    "user" => query.Where(e => e.Adventure.OwnerId != _masterUserId),
                    _ => query
                };
            }

            if (request.IsPublished.HasValue) {
                query = query.Where(e => e.IsPublished == request.IsPublished.Value);
            }

            var totalCount = await query.CountAsync(ct);

            var skip = request.Skip ?? 0;
            var take = request.Take ?? 20;

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            query = sortBy switch {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(e => e.Name)
                    : query.OrderBy(e => e.Name),
                _ => sortOrder == "desc"
                    ? query.OrderByDescending(e => e.Name)
                    : query.OrderBy(e => e.Name)
            };

            var encounters = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = encounters.Count > take;
            if (hasMore) {
                encounters = [.. encounters.Take(take)];
            }

            var ownerIds = encounters.Select(e => e.Adventure.OwnerId).Distinct().ToList();
            var owners = await userManager.Users
                .Where(u => ownerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);

            var content = new List<LibraryContentResponse>();
            foreach (var encounter in encounters) {
                var ownerName = owners.GetValueOrDefault(encounter.Adventure.OwnerId);
                content.Add(MapToContentResponse(encounter, encounter.Adventure.OwnerId, ownerName));
            }

            logger.LogInformation(
                "Encounter search completed: {Count} encounters found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error searching encounters");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetEncounterByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var encounter = await dbContext.Encounters
                .Include(e => e.Adventure)
                .FirstOrDefaultAsync(e => e.Id == id, ct);

            if (encounter is null) {
                return null;
            }

            var ownerName = await GetOwnerNameAsync(encounter.Adventure.OwnerId, ct);
            return MapToContentResponse(encounter, encounter.Adventure.OwnerId, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateEncounterAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException("Name cannot be empty", nameof(name));
            }

            var defaultAdventure = await dbContext.Adventures
                .Where(a => a.OwnerId == _masterUserId)
                .OrderBy(a => a.Name)
                .FirstOrDefaultAsync(ct);

            if (defaultAdventure is null) {
                throw new InvalidOperationException("No default adventure found for master user");
            }

            var encounter = new Encounter {
                AdventureId = defaultAdventure.Id,
                Name = name,
                Description = description,
                IsPublished = false
            };

            dbContext.Encounters.Add(encounter);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Created encounter {EncounterId} with name '{Name}'", encounter.Id, encounter.Name);

            var ownerName = await GetOwnerNameAsync(defaultAdventure.OwnerId, ct);
            return MapToContentResponse(encounter, defaultAdventure.OwnerId, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating encounter with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateEncounterAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        CancellationToken ct = default) {
        try {
            var encounter = await dbContext.Encounters
                .Include(e => e.Adventure)
                .FirstOrDefaultAsync(e => e.Id == id, ct);

            if (encounter is null) {
                throw new InvalidOperationException($"Encounter with ID {id} not found");
            }

            if (name is not null) {
                encounter.Name = name;
            }

            if (description is not null) {
                encounter.Description = description;
            }

            if (isPublished.HasValue) {
                encounter.IsPublished = isPublished.Value;
            }

            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Updated encounter {EncounterId}", id);

            var ownerName = await GetOwnerNameAsync(encounter.Adventure.OwnerId, ct);
            return MapToContentResponse(encounter, encounter.Adventure.OwnerId, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task DeleteEncounterAsync(Guid id, CancellationToken ct = default) {
        try {
            var encounter = await dbContext.Encounters.FindAsync([id], ct);
            if (encounter is null) {
                logger.LogWarning("Attempted to delete non-existent encounter {EncounterId}", id);
                return;
            }

            dbContext.Encounters.Remove(encounter);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Deleted encounter {EncounterId}", id);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task TransferEncounterOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var encounter = await dbContext.Encounters
                .Include(e => e.Adventure)
                .FirstOrDefaultAsync(e => e.Id == id, ct);

            if (encounter is null) {
                throw new InvalidOperationException($"Encounter with ID {id} not found");
            }

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => _masterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            encounter.Adventure.OwnerId = newOwnerId;
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation(
                "Transferred encounter {EncounterId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error transferring ownership of encounter {EncounterId}", id);
            throw;
        }
    }

    public async Task<LibraryContentSearchResponse> SearchAssetsAsync(
        LibrarySearchRequest request,
        CancellationToken ct = default) {
        try {
            var query = dbContext.Assets.AsQueryable();

            query = ApplySearchFilters(query, request);

            var totalCount = await query.CountAsync(ct);

            var skip = request.Skip ?? 0;
            var take = request.Take ?? 20;

            var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
            var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

            query = sortBy switch {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(a => a.Name)
                    : query.OrderBy(a => a.Name),
                _ => sortOrder == "desc"
                    ? query.OrderByDescending(a => a.Name)
                    : query.OrderBy(a => a.Name)
            };

            var assets = await query
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync(ct);

            var hasMore = assets.Count > take;
            if (hasMore) {
                assets = [.. assets.Take(take)];
            }

            var ownerIds = assets.Select(a => a.OwnerId).Distinct().ToList();
            var owners = await userManager.Users
                .Where(u => ownerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);

            var content = new List<LibraryContentResponse>();
            foreach (var asset in assets) {
                var ownerName = owners.GetValueOrDefault(asset.OwnerId);
                content.Add(MapToContentResponse(asset, ownerName));
            }

            logger.LogInformation(
                "Asset search completed: {Count} assets found (Skip: {Skip}, Take: {Take}, Total: {Total})",
                content.Count, skip, take, totalCount);

            return new LibraryContentSearchResponse {
                Content = content.AsReadOnly(),
                TotalCount = totalCount,
                HasMore = hasMore
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error searching assets");
            throw;
        }
    }

    public async Task<LibraryContentResponse?> GetAssetByIdAsync(Guid id, CancellationToken ct = default) {
        try {
            var asset = await dbContext.Assets.FindAsync([id], ct);
            if (asset is null) {
                return null;
            }

            var ownerName = await GetOwnerNameAsync(asset.OwnerId, ct);
            return MapToContentResponse(asset, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving asset {AssetId}", id);
            throw;
        }
    }

    public async Task<LibraryContentResponse> CreateAssetAsync(
        string name,
        string description,
        CancellationToken ct = default) {
        try {
            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException("Name cannot be empty", nameof(name));
            }

            var asset = new Asset {
                OwnerId = _masterUserId,
                Name = name,
                Description = description,
                IsPublished = false,
                IsPublic = false
            };

            dbContext.Assets.Add(asset);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Created asset {AssetId} with name '{Name}'", asset.Id, asset.Name);

            var ownerName = await GetOwnerNameAsync(asset.OwnerId, ct);
            return MapToContentResponse(asset, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating asset with name '{Name}'", name);
            throw;
        }
    }

    public async Task<LibraryContentResponse> UpdateAssetAsync(
        Guid id,
        string? name,
        string? description,
        bool? isPublished,
        bool? isPublic,
        CancellationToken ct = default) {
        try {
            var asset = await dbContext.Assets.FindAsync([id], ct);
            if (asset is null) {
                throw new InvalidOperationException($"Asset with ID {id} not found");
            }

            if (name is not null) {
                asset.Name = name;
            }

            if (description is not null) {
                asset.Description = description;
            }

            if (isPublished.HasValue) {
                asset.IsPublished = isPublished.Value;
            }

            if (isPublic.HasValue) {
                asset.IsPublic = isPublic.Value;
            }

            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Updated asset {AssetId}", id);

            var ownerName = await GetOwnerNameAsync(asset.OwnerId, ct);
            return MapToContentResponse(asset, ownerName);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating asset {AssetId}", id);
            throw;
        }
    }

    public async Task DeleteAssetAsync(Guid id, CancellationToken ct = default) {
        try {
            var asset = await dbContext.Assets.FindAsync([id], ct);
            if (asset is null) {
                logger.LogWarning("Attempted to delete non-existent asset {AssetId}", id);
                return;
            }

            dbContext.Assets.Remove(asset);
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation("Deleted asset {AssetId}", id);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting asset {AssetId}", id);
            throw;
        }
    }

    public async Task TransferAssetOwnershipAsync(
        Guid id,
        TransferOwnershipRequest request,
        CancellationToken ct = default) {
        try {
            var asset = await dbContext.Assets.FindAsync([id], ct);
            if (asset is null) {
                throw new InvalidOperationException($"Asset with ID {id} not found");
            }

            var newOwnerId = request.Action.ToLowerInvariant() switch {
                "take" => _masterUserId,
                "grant" => request.TargetUserId ?? throw new InvalidOperationException("TargetUserId is required for 'grant' action"),
                _ => throw new InvalidOperationException($"Invalid action: {request.Action}")
            };

            asset.OwnerId = newOwnerId;
            await dbContext.SaveChangesAsync(ct);

            logger.LogInformation(
                "Transferred asset {AssetId} ownership to user {UserId} via action '{Action}'",
                id, newOwnerId, request.Action);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error transferring ownership of asset {AssetId}", id);
            throw;
        }
    }

    private IQueryable<T> ApplySearchFilters<T>(IQueryable<T> query, LibrarySearchRequest request)
        where T : class {
        if (!string.IsNullOrWhiteSpace(request.Search)) {
            var searchTerm = request.Search.Trim().ToLowerInvariant();

            if (typeof(T) == typeof(World)) {
                query = query.Cast<World>()
                    .Where(w => w.Name.ToLower().Contains(searchTerm) ||
                                w.Description.ToLower().Contains(searchTerm))
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Campaign)) {
                query = query.Cast<Campaign>()
                    .Where(c => c.Name.ToLower().Contains(searchTerm) ||
                                c.Description.ToLower().Contains(searchTerm))
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Adventure)) {
                query = query.Cast<Adventure>()
                    .Where(a => a.Name.ToLower().Contains(searchTerm) ||
                                a.Description.ToLower().Contains(searchTerm))
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Asset)) {
                query = query.Cast<Asset>()
                    .Where(a => a.Name.ToLower().Contains(searchTerm) ||
                                a.Description.ToLower().Contains(searchTerm))
                    .Cast<T>();
            }
        }

        if (request.OwnerId.HasValue) {
            if (typeof(T) == typeof(World)) {
                query = query.Cast<World>()
                    .Where(w => w.OwnerId == request.OwnerId.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Campaign)) {
                query = query.Cast<Campaign>()
                    .Where(c => c.OwnerId == request.OwnerId.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Adventure)) {
                query = query.Cast<Adventure>()
                    .Where(a => a.OwnerId == request.OwnerId.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Asset)) {
                query = query.Cast<Asset>()
                    .Where(a => a.OwnerId == request.OwnerId.Value)
                    .Cast<T>();
            }
        }

        if (!string.IsNullOrWhiteSpace(request.OwnerType)) {
            var ownerType = request.OwnerType.ToLowerInvariant();

            if (typeof(T) == typeof(World)) {
                query = ownerType switch {
                    "master" => query.Cast<World>().Where(w => w.OwnerId == _masterUserId).Cast<T>(),
                    "user" => query.Cast<World>().Where(w => w.OwnerId != _masterUserId).Cast<T>(),
                    _ => query
                };
            }
            else if (typeof(T) == typeof(Campaign)) {
                query = ownerType switch {
                    "master" => query.Cast<Campaign>().Where(c => c.OwnerId == _masterUserId).Cast<T>(),
                    "user" => query.Cast<Campaign>().Where(c => c.OwnerId != _masterUserId).Cast<T>(),
                    _ => query
                };
            }
            else if (typeof(T) == typeof(Adventure)) {
                query = ownerType switch {
                    "master" => query.Cast<Adventure>().Where(a => a.OwnerId == _masterUserId).Cast<T>(),
                    "user" => query.Cast<Adventure>().Where(a => a.OwnerId != _masterUserId).Cast<T>(),
                    _ => query
                };
            }
            else if (typeof(T) == typeof(Asset)) {
                query = ownerType switch {
                    "master" => query.Cast<Asset>().Where(a => a.OwnerId == _masterUserId).Cast<T>(),
                    "user" => query.Cast<Asset>().Where(a => a.OwnerId != _masterUserId).Cast<T>(),
                    _ => query
                };
            }
        }

        if (request.IsPublished.HasValue) {
            if (typeof(T) == typeof(World)) {
                query = query.Cast<World>()
                    .Where(w => w.IsPublished == request.IsPublished.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Campaign)) {
                query = query.Cast<Campaign>()
                    .Where(c => c.IsPublished == request.IsPublished.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Adventure)) {
                query = query.Cast<Adventure>()
                    .Where(a => a.IsPublished == request.IsPublished.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Asset)) {
                query = query.Cast<Asset>()
                    .Where(a => a.IsPublished == request.IsPublished.Value)
                    .Cast<T>();
            }
        }

        if (request.IsPublic.HasValue) {
            if (typeof(T) == typeof(World)) {
                query = query.Cast<World>()
                    .Where(w => w.IsPublic == request.IsPublic.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Campaign)) {
                query = query.Cast<Campaign>()
                    .Where(c => c.IsPublic == request.IsPublic.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Adventure)) {
                query = query.Cast<Adventure>()
                    .Where(a => a.IsPublic == request.IsPublic.Value)
                    .Cast<T>();
            }
            else if (typeof(T) == typeof(Asset)) {
                query = query.Cast<Asset>()
                    .Where(a => a.IsPublic == request.IsPublic.Value)
                    .Cast<T>();
            }
        }

        return query;
    }

    private async Task<string?> GetOwnerNameAsync(Guid ownerId, CancellationToken ct) {
        var user = await userManager.FindByIdAsync(ownerId.ToString());
        return user?.DisplayName;
    }

    private static LibraryContentResponse MapToContentResponse(World world, string? ownerName) {
        return new LibraryContentResponse {
            Id = world.Id,
            OwnerId = world.OwnerId,
            OwnerName = ownerName,
            Name = world.Name,
            Description = world.Description,
            IsPublished = world.IsPublished,
            IsPublic = world.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
    }

    private static LibraryContentResponse MapToContentResponse(Campaign campaign, string? ownerName) {
        return new LibraryContentResponse {
            Id = campaign.Id,
            OwnerId = campaign.OwnerId,
            OwnerName = ownerName,
            Name = campaign.Name,
            Description = campaign.Description,
            IsPublished = campaign.IsPublished,
            IsPublic = campaign.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
    }

    private static LibraryContentResponse MapToContentResponse(Adventure adventure, string? ownerName) {
        return new LibraryContentResponse {
            Id = adventure.Id,
            OwnerId = adventure.OwnerId,
            OwnerName = ownerName,
            Name = adventure.Name,
            Description = adventure.Description,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
    }

    private static LibraryContentResponse MapToContentResponse(Encounter encounter, Guid ownerId, string? ownerName) {
        return new LibraryContentResponse {
            Id = encounter.Id,
            OwnerId = ownerId,
            OwnerName = ownerName,
            Name = encounter.Name,
            Description = encounter.Description,
            IsPublished = encounter.IsPublished,
            IsPublic = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
    }

    private static LibraryContentResponse MapToContentResponse(Asset asset, string? ownerName) {
        return new LibraryContentResponse {
            Id = asset.Id,
            OwnerId = asset.OwnerId,
            OwnerName = ownerName,
            Name = asset.Name,
            Description = asset.Description,
            IsPublished = asset.IsPublished,
            IsPublic = asset.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
    }
}
