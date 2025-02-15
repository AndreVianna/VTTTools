﻿namespace HttpServices.Abstractions.Model;

public class UserToken()
    : UserToken<string>();

public class UserToken<TKey>()
    : IdentityUserToken<TKey>()
    where TKey : IEquatable<TKey> {
}
