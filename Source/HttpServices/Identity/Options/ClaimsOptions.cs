namespace HttpServices.Identity.Options;

public class ClaimsOptions {
    public string IdClaimType { get; set; } = AuthenticationClaimTypes.Id;
    public string IdentifierClaimType { get; set; } = AuthenticationClaimTypes.Identifier;
    public string EmailClaimType { get; set; } = AuthenticationClaimTypes.Email;
    public string UserNameClaimType { get; set; } = AuthenticationClaimTypes.UserName;
    public string PhoneNumberClaimType { get; set; } = AuthenticationClaimTypes.PhoneNumber;
    public string RolesClaimType { get; set; } = AuthenticationClaimTypes.Roles;
    public string RoleClaimType { get; set; } = AuthenticationClaimTypes.Role;
    public string ProfileClaimType { get; set; } = AuthenticationClaimTypes.Profile;
    public string SecurityStampClaimType { get; set; } = AuthenticationClaimTypes.SecurityStamp;
}
