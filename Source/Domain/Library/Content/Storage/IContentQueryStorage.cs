namespace VttTools.Library.Content.Storage;

public interface IContentQueryStorage {
    Task<ContentListItem[]> QueryContentAsync(
        Guid authenticatedUserId,
        ContentFilters filters,
        CancellationToken ct = default);
}