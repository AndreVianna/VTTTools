namespace VttTools.Library.Services;

public class ContentQueryService(ApplicationDbContext context) : IContentQueryService {
    public async Task<PagedContentResponse> GetContentAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct = default) {
        var adventures = await QueryAdventuresAsync(authenticatedUserId, filters, ct);
        var hasMore = adventures.Length > filters.Limit;
        var data = hasMore ? [.. adventures.Take(filters.Limit)] : adventures;

        return new PagedContentResponse {
            Data = data,
            NextCursor = data.Length > 0 ? data[^1].Id : null,
            HasMore = hasMore
        };
    }

    private async Task<ContentListItem[]> QueryAdventuresAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct) {
        var baseQuery = context.Adventures
            .Include(a => a.Background)
            .Include(a => a.Encounters)
            .AsNoTracking();

        var query = baseQuery;

        query = filters.Owner switch {
            "mine" => query.Where(a => a.OwnerId == authenticatedUserId),
            "public" => query.Where(a => a.IsPublic && a.IsPublished),
            _ => query.Where(a => a.OwnerId == authenticatedUserId || (a.IsPublic && a.IsPublished))
        };

        if (filters.Style.HasValue) {
            query = query.Where(a => a.Style == filters.Style.Value);
        }

        if (filters.IsOneShot.HasValue) {
            query = query.Where(a => a.IsOneShot == filters.IsOneShot.Value);
        }

        if (filters.MinEncounterCount.HasValue) {
            query = query.Where(a => a.Encounters.Count >= filters.MinEncounterCount.Value);
        }

        if (filters.MaxEncounterCount.HasValue) {
            query = query.Where(a => a.Encounters.Count <= filters.MaxEncounterCount.Value);
        }

        if (filters.IsPublished.HasValue) {
            query = query.Where(a => a.IsPublished == filters.IsPublished.Value);
        }

        if (!string.IsNullOrWhiteSpace(filters.Search)) {
            query = query.Where(a => EF.Functions.Like(a.Name, $"%{filters.Search}%"));
        }

        if (filters.After.HasValue) {
            query = query.Where(a => a.Id.CompareTo(filters.After.Value) < 0);
        }

        query = query.OrderByDescending(a => a.Id);

        query = query.Take(filters.Limit + 1);

        var entities = await query.ToArrayAsync(ct);

        return [..entities.Select(a => new ContentListItem {
            Id = a.Id,
            Type = ContentType.Adventure,
            Name = a.Name,
            Description = a.Description,
            IsPublished = a.IsPublished,
            OwnerId = a.OwnerId,
            Style = a.Style,
            IsOneShot = a.IsOneShot,
            EncounterCount = a.Encounters.Count,
            Background = a.Background != null ? new Resource {
                Id = a.Background.Id,
                Type = a.Background.Type,
                Description = a.Background.Description,
                Features = [..a.Background.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())],
                Path = a.Background.Path,
                ContentType = a.Background.ContentType,
                FileName = a.Background.FileName,
                FileLength = a.Background.FileLength,
                Size = a.Background.Size,
                Duration = a.Background.Duration,
            } : null
        })];
    }
}