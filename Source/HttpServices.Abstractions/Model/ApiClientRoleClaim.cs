namespace HttpServices.Abstractions.Model;

public class ApiClientRoleClaim()
    : ApiClientRoleClaim<Guid>();

public class ApiClientRoleClaim<TKey>()
    : IdentityRoleClaim<TKey>()
    where TKey : IEquatable<TKey>;
