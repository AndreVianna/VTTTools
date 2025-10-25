using VttTools.Library.Content.ApiContracts;
using VttTools.Library.Content.ServiceContracts;

namespace VttTools.Library.Content.Services;

public interface IContentQueryService {
    Task<PagedContentResponse> GetContentAsync(Guid authenticatedUserId, ContentFilters filters, CancellationToken ct = default);
}