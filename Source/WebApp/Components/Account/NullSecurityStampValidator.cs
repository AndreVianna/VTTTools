namespace WebApp.Components.Account;

public class NullSecurityStampValidator : ISecurityStampValidator {
    public Task ValidateAsync(CookieValidatePrincipalContext context) => Task.CompletedTask;
}
