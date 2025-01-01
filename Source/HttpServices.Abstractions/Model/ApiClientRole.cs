namespace HttpServices.Abstractions.Model;

public class ApiClientRole()
    : ApiClientRole<Guid>();

public class ApiClientRole<TKey>()
    : IdentityRole<TKey>()
    where TKey : IEquatable<TKey>;
