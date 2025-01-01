namespace IdentityService.Handlers.SignIn;

public record SignInToken(DateTime Expiration, string Value);
