
using static VttTools.Middlewares.UserIdentificationOptions;

namespace VttTools.Middlewares;

public partial class UserIdentificationHandler(IOptionsMonitor<UserIdentificationOptions> options,
                                               ILoggerFactory loggerFactory)
    : AuthenticationHandler<UserIdentificationOptions>(options, loggerFactory, UrlEncoder.Default) {
    protected override Task<AuthenticateResult> HandleAuthenticateAsync() {
        var header = Request.Headers[UserHeader].FirstOrDefault();
        if (string.IsNullOrEmpty(header))
            return Task.FromResult(AuthenticateResult.Fail("User header is missing."));

        if (!IsValidUserId(header))
            return Task.FromResult(AuthenticateResult.Fail("Invalid user header."));

        var userId = new Guid(Base64UrlTextEncoder.Decode(header));

        var idClaim = new Claim(ClaimTypes.NameIdentifier, userId.ToString("n"));
        Request.HttpContext.User = new(new ClaimsIdentity([idClaim], Scheme.Name));
        var ticket = new AuthenticationTicket(Request.HttpContext.User, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private static bool IsValidUserId(string userId)
        => !string.IsNullOrWhiteSpace(userId)
        && ValidUserId().IsMatch(userId);

    [GeneratedRegex("^[a-zA-Z0-9_-]+$")]
    private static partial Regex ValidUserId();
}