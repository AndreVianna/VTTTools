namespace VttTools.Library.Content.Services;

public interface IContentQueryService {
    Task<PagedContentResponse> GetContentAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct = default);
}