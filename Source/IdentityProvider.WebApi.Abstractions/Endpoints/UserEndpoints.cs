namespace WebApi.Endpoints;

public static class UserEndpoints {
    public const string UsersPrefix = "/users";

    public static class Authentication {
        public const string AuthenticationPrefix = "/auth";
        public const string SignIn = "/sign-in";
        public const string SignOut = "/sign-out";
        public const string GetAuthenticationSchemes = "/schemes";
    }
}
