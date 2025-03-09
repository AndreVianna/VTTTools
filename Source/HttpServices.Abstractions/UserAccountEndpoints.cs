namespace HttpServices;

public static class UserAccountEndpoints {
    public const string UsersEndpoint = "/users";
    public const string FindUserByIdEndpoint = "/users";
    public static string FindUserByIdUri(string id) => $"/users/{id}";
}
