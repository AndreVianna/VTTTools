namespace VttTools.Middlewares;

public class UserIdentificationOptions :
    AuthenticationSchemeOptions {
    public const string Scheme = "User";
    public const string UserHeader = "x-user";
}