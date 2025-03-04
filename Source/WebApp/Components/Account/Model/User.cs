﻿namespace WebApp.Components.Account.Model;

public record WebAppUser {
    [Required]
    [StringLength(48)]
    public required string Id { get; init; }

    [Required]
    [StringLength(256)]
    public required string Email { get; init; }

    [Required]
    [StringLength(256)]
    public required string Name { get; init; }

    [StringLength(256)]
    public string? PreferredName { get; init; }

    [StringLength(25)]
    public string? PhoneNumber { get; init; }
}
