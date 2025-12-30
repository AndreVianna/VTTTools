namespace VttTools.Library.Services;

public class ContentQueryService(IContentQueryStorage storage) : IContentQueryService {
    public async Task<PagedContentResponse> GetContentAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct = default) {
        var items = await storage.QueryContentAsync(authenticatedUserId, filters, ct);
        var hasMore = items.Length > filters.Limit;
        var data = hasMore ? [.. items.Take(filters.Limit)] : items;

        return new() {
            Data = data,
            NextCursor = data.Length > 0 ? data[^1].Id : null,
            HasMore = hasMore,
        };
    }
}
