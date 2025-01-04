﻿namespace HttpServices.Abstractions.Contracts.Client;

public sealed record RegisterClientResponse {
    public required string ClientId { get; init; }
    public required string ClientSecret { get; init; }
}