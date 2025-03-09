namespace HttpServices.Identity.Options;

public class AuthenticationServiceOptions {
    public IdentifierType IdentifierType { get; set; } = IdentifierType.Email;
    public ClaimsOptions ClaimsIdentity { get; set; } = new();
    public MasterOptions? Master { get; set; }
    public PasswordOptions Password { get; set; } = new();
    public LockoutOptions Lockout { get; set; } = new();
    public SignInOptions SignIn { get; set; } = new();
    public TokenOptions Tokens { get; set; } = new();
    public StoreOptions Stores { get; set; } = new();
}
