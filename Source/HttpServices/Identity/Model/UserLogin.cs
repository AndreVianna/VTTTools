namespace HttpServices.Identity.Model;

public class UserLogin()
    : UserLogin<string>();

public class UserLogin<TKey>()
    : IdentityUserLogin<TKey>()
    where TKey : IEquatable<TKey>;
