namespace VttTools.Middlewares;

public class BasicUserAuthenticationOptions :
    AuthenticationSchemeOptions {
    public const string DefaultScheme = "BasicUser";
    public const string UserHeader = "x-user";
}
