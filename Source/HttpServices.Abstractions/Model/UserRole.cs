namespace HttpServices.Abstractions.Model;

public class UserRole()
    : UserRole<string>();

public class UserRole<TKey>()
    : IdentityUserRole<TKey>()
    where TKey : IEquatable<TKey>;
