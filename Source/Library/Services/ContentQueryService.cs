using Microsoft.EntityFrameworkCore;

using VttTools.Data;
using VttTools.Data.Library;
using VttTools.Data.Media;
using VttTools.Library.Content.ApiContracts;
using VttTools.Library.Content.Model;
using VttTools.Library.Content.ServiceContracts;
using VttTools.Library.Content.Services;

namespace VttTools.Library.Services;

public class ContentQueryService(ApplicationDbContext context) : IContentQueryService {
    public async Task<PagedContentResponse> GetContentAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct = default) {
        var adventures = await QueryAdventuresAsync(authenticatedUserId, filters, ct);
        var hasMore = adventures.Length > filters.Limit;
        var data = hasMore ? [..adventures.Take(filters.Limit)] : adventures;

        return new PagedContentResponse {
            Data = data,
            NextCursor = data.Length > 0 ? data[^1].Id : null,
            HasMore = hasMore
        };
    }

    private async Task<ContentListItem[]> QueryAdventuresAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct) {
        var baseQuery = context.Adventures
            .Include(a => a.Background)
            .Include(a => a.Scenes)
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

        if (filters.MinSceneCount.HasValue) {
            query = query.Where(a => a.Scenes.Count >= filters.MinSceneCount.Value);
        }

        if (filters.MaxSceneCount.HasValue) {
            query = query.Where(a => a.Scenes.Count <= filters.MaxSceneCount.Value);
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
            SceneCount = a.Scenes.Count,
            Background = a.Background != null ? new Resource {
                Id = a.Background.Id,
                Type = a.Background.Type,
                Path = a.Background.Path,
                Metadata = new ResourceMetadata {
                    ContentType = a.Background.ContentType,
                    FileName = a.Background.FileName,
                    FileLength = a.Background.FileLength,
                    ImageSize = a.Background.ImageSize,
                    Duration = a.Background.Duration
                },
                Tags = a.Background.Tags
            } : null
        })];
    }
}