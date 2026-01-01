namespace VttTools.Auth.ApiContracts;

public record UpdateProfileRequest : Request {
    public string? Name { get; init; }
    public string? DisplayName { get; init; }
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
    public UnitSystem? PreferredUnitSystem { get; init; }
}