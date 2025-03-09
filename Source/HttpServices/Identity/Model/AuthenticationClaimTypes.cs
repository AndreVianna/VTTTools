namespace HttpServices.Identity.Model;

public static class AuthenticationClaimTypes {
    private static readonly ClaimsIdentityOptions _defaultIdentityClaims = new();

    public const string Id = "AuthenticationService.Identity.Id";
    public const string Identifier = "AuthenticationService.Identity.Identifier";
    public const string Email = "AuthenticationService.Identity.Email";
    public const string UserName = "AuthenticationService.Identity.UserName";
    public const string PhoneNumber = "AuthenticationService.Identity.PhoneNumber";
    public const string Roles = "AuthenticationService.Identity.Roles";
    public const string Role = "AuthenticationService.Identity.Role";
    public const string Profile = "AuthenticationService.Identity.Profile";
    public static readonly string SecurityStamp = _defaultIdentityClaims.SecurityStampClaimType;
}
