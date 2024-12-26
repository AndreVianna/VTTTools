namespace AuthService.Handlers.SignIn;

public record SignInToken(DateTime Expiration, string Value);
