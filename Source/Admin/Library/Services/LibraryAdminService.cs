
namespace VttTools.Admin.Library.Services;

public abstract class LibraryAdminService(
    IOptions<PublicLibraryOptions> options,
    IUserStorage userStorage,
    ILogger logger) {

    protected Guid MasterUserId => options.Value.MasterUserId;
    protected IUserStorage UserStorage => userStorage;
    protected ILogger Logger => logger;

    protected async Task<string?> GetOwnerNameAsync(Guid ownerId) {
        var user = await UserStorage.FindByIdAsync(ownerId);
        return user?.DisplayName;
    }

    protected Task<IReadOnlyDictionary<Guid, string?>> GetOwnerDictionaryAsync(
        IEnumerable<Guid> ownerIds,
        CancellationToken ct = default)
        => UserStorage.GetDisplayNamesAsync(ownerIds, ct);

    protected static IQueryable<T> ApplySearchFilters<T>(
        IQueryable<T> query,
        LibrarySearchRequest request,
        Guid masterUserId,
        Expression<Func<T, string>> nameSelector,
        Expression<Func<T, string>> descriptionSelector,
        Expression<Func<T, Guid>> ownerIdSelector,
        Expression<Func<T, bool>> isPublishedSelector,
        Expression<Func<T, bool>> isPublicSelector) {

        if (!string.IsNullOrWhiteSpace(request.Search)) {
            var search = request.Search.ToLowerInvariant();
            var nameParam = nameSelector.Parameters[0];
            var descParam = descriptionSelector.Parameters[0];

            var nameContains = Expression.Call(
                Expression.Call(nameSelector.Body, typeof(string).GetMethod("ToLower", Type.EmptyTypes)!),
                typeof(string).GetMethod("Contains", [typeof(string)])!,
                Expression.Constant(search));

            var descContains = Expression.Call(
                Expression.Call(descriptionSelector.Body, typeof(string).GetMethod("ToLower", Type.EmptyTypes)!),
                typeof(string).GetMethod("Contains", [typeof(string)])!,
                Expression.Constant(search));

            var orExpr = Expression.OrElse(nameContains, descContains);
            var lambda = Expression.Lambda<Func<T, bool>>(orExpr, nameParam);
            query = query.Where(lambda);
        }

        if (request.OwnerId.HasValue) {
            var param = ownerIdSelector.Parameters[0];
            var equalExpr = Expression.Equal(ownerIdSelector.Body, Expression.Constant(request.OwnerId.Value));
            var lambda = Expression.Lambda<Func<T, bool>>(equalExpr, param);
            query = query.Where(lambda);
        }

        if (!string.IsNullOrWhiteSpace(request.OwnerType)) {
            var param = ownerIdSelector.Parameters[0];
            Expression filterExpr = request.OwnerType.ToLowerInvariant() switch {
                "master" => Expression.Equal(ownerIdSelector.Body, Expression.Constant(masterUserId)),
                "user" => Expression.NotEqual(ownerIdSelector.Body, Expression.Constant(masterUserId)),
                _ => Expression.Constant(true)
            };
            var lambda = Expression.Lambda<Func<T, bool>>(filterExpr, param);
            query = query.Where(lambda);
        }

        if (request.IsPublished.HasValue) {
            var param = isPublishedSelector.Parameters[0];
            var equalExpr = Expression.Equal(isPublishedSelector.Body, Expression.Constant(request.IsPublished.Value));
            var lambda = Expression.Lambda<Func<T, bool>>(equalExpr, param);
            query = query.Where(lambda);
        }

        if (request.IsPublic.HasValue) {
            var param = isPublicSelector.Parameters[0];
            var equalExpr = Expression.Equal(isPublicSelector.Body, Expression.Constant(request.IsPublic.Value));
            var lambda = Expression.Lambda<Func<T, bool>>(equalExpr, param);
            query = query.Where(lambda);
        }

        return query;
    }

    protected static (int Skip, int Take) GetPagination(LibrarySearchRequest request) {
        var skip = Math.Max(0, request.Skip ?? 0);
        var take = Math.Clamp(request.Take ?? 20, 1, 100);
        return (skip, take);
    }

    protected static IOrderedQueryable<T> ApplySorting<T>(
        IQueryable<T> query,
        LibrarySearchRequest request,
        Expression<Func<T, string>> defaultSortSelector) {

        var sortBy = request.SortBy?.ToLowerInvariant() ?? "name";
        var descending = request.SortOrder?.ToLowerInvariant() == "desc";

        return sortBy switch {
            "name" => descending
                ? query.OrderByDescending(defaultSortSelector)
                : query.OrderBy(defaultSortSelector),
            _ => descending
                ? query.OrderByDescending(defaultSortSelector)
                : query.OrderBy(defaultSortSelector)
        };
    }
}