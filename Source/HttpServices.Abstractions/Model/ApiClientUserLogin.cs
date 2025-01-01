namespace HttpServices.Abstractions.Model;

public class ApiClientUserLogin()
    : ApiClientUserLogin<Guid>();

public class ApiClientUserLogin<TKey>()
    : IdentityUserLogin<TKey>()
    where TKey : IEquatable<TKey>;
