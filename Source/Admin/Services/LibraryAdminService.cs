namespace VttTools.Admin.Services;

public abstract class LibraryAdminService(
    IOptions<PublicLibraryOptions> options,
    ApplicationDbContext dbContext,
    UserManager<User> userManager,
    ILogger logger) {

    protected Guid MasterUserId => options.Value.MasterUserId;
    protected ApplicationDbContext DbContext => dbContext;
    protected UserManager<User> UserManager => userManager;
    protected ILogger Logger => logger;

    protected async Task<string?> GetOwnerNameAsync(Guid ownerId) {
        var user = await UserManager.FindByIdAsync(ownerId.ToString());
        return user?.DisplayName;
    }

    protected static IQueryable<T> ApplySearchFilters<T>(
        IQueryable<T> query,
        LibrarySearchRequest request,
        Guid masterUserId,
        Func<T, string> nameSelector,
        Func<T, string> descriptionSelector,
        Func<T, Guid> ownerIdSelector,
        Func<T, bool>? isPublishedSelector = null,
        Func<T, bool>? isPublicSelector = null) where T : class {

        if (!string.IsNullOrWhiteSpace(request.Search)) {
            query = query.Where(item =>
                nameSelector(item).Contains(request.Search, StringComparison.CurrentCultureIgnoreCase) ||
                descriptionSelector(item).Contains(request.Search, StringComparison.CurrentCultureIgnoreCase));
        }

        if (request.OwnerId.HasValue) {
            query = query.Where(item => ownerIdSelector(item) == request.OwnerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.OwnerType)) {
            var ownerType = request.OwnerType.ToLowerInvariant();
            query = ownerType switch {
                "master" => query.Where(item => ownerIdSelector(item) == masterUserId),
                "user" => query.Where(item => ownerIdSelector(item) != masterUserId),
                _ => query
            };
        }

        if (request.IsPublished.HasValue && isPublishedSelector is not null) {
            query = query.Where(item => isPublishedSelector(item) == request.IsPublished.Value);
        }

        if (request.IsPublic.HasValue && isPublicSelector is not null) {
            query = query.Where(item => isPublicSelector(item) == request.IsPublic.Value);
        }

        return query;
    }

    protected static IOrderedQueryable<T> ApplySorting<T>(
        IQueryable<T> query,
        LibrarySearchRequest request,
        Expression<Func<T, string>> nameSelector) where T : class {

        var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
        var sortOrder = request.SortOrder?.ToLowerInvariant() ?? "asc";

        return sortBy switch {
            "name" => sortOrder == "desc"
                ? query.OrderByDescending(nameSelector)
                : query.OrderBy(nameSelector),
            _ => sortOrder == "desc"
                ? query.OrderByDescending(nameSelector)
                : query.OrderBy(nameSelector)
        };
    }

    protected static (int skip, int take) GetPagination(LibrarySearchRequest request) {
        var skip = request.Skip ?? 0;
        var take = request.Take ?? 20;
        return (skip, take);
    }

    protected async Task<Dictionary<Guid, string?>> GetOwnerDictionaryAsync(
        IEnumerable<Guid> ownerIds,
        CancellationToken ct = default) {
        var distinctOwnerIds = ownerIds.Distinct().ToList();
        return await UserManager.Users
            .Where(u => distinctOwnerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName ?? u.UserName, ct);
    }
}