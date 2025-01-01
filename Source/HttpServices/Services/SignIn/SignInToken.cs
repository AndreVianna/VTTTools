namespace HttpServices.Services.SignIn;

public record SignInToken(DateTime Expiration, string Value);
