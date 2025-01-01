﻿namespace ApiService.Data.Model;

public class ApiClientUserToken
    : ApiClientUserToken<Guid>;

public class ApiClientUserToken<TKey>
    : IdentityUserToken<TKey>
    where TKey : IEquatable<TKey>;