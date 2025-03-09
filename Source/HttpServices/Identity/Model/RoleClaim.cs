namespace HttpServices.Identity.Model;

public class RoleClaim()
    : RoleClaim<string>();

public class RoleClaim<TKey>()
    : IdentityRoleClaim<TKey>()
    where TKey : IEquatable<TKey>;
