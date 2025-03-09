namespace HttpServices.Identity.Model;

public class UserToken()
    : UserToken<string>();

public class UserToken<TKey>()
    : IdentityUserToken<TKey>()
    where TKey : IEquatable<TKey> {
}
