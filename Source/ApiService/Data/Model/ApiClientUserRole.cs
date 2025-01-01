namespace ApiService.Data.Model;

public class ApiClientUserRole
    : ApiClientUserRole<Guid>;

public class ApiClientUserRole<TKey>
    : IdentityUserRole<TKey>
    where TKey : IEquatable<TKey>;
