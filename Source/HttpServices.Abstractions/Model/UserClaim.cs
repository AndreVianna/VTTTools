namespace HttpServices.Abstractions.Model;

public class UserClaim()
    : UserClaim<string>();

public class UserClaim<TKey>()
    : IdentityUserClaim<TKey>()
    where TKey : IEquatable<TKey>;
