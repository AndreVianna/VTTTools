namespace HttpServices.Model;

public class ExtendedIdentityOptions : IdentityOptions {
    public MasterUserOptions? MasterUser { get; set; }
}
