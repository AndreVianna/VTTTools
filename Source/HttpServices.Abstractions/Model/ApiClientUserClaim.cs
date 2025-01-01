﻿namespace HttpServices.Abstractions.Model;

public class ApiClientUserClaim()
    : ApiClientUserClaim<Guid>();

public class ApiClientUserClaim<TKey>()
    : IdentityUserClaim<TKey>()
    where TKey : IEquatable<TKey>;
