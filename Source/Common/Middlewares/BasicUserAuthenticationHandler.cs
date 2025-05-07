using static VttTools.Middlewares.BasicUserAuthenticationOptions;

namespace VttTools.Middlewares;

public partial class BasicUserAuthenticationHandler(IOptionsMonitor<BasicUserAuthenticationOptions> options,
                                                    ILoggerFactory loggerFactory)
    : AuthenticationHandler<BasicUserAuthenticationOptions>(options, loggerFactory, UrlEncoder.Default) {
    protected override Task<AuthenticateResult> HandleAuthenticateAsync() {
        var userHeader = Request.Headers[UserHeader].FirstOrDefault();
        if (string.IsNullOrEmpty(userHeader))
            return Task.FromResult(AuthenticateResult.Fail("User header is missing."));

        if (!IsValidUserId(userHeader))
            return Task.FromResult(AuthenticateResult.Fail("Invalid user header."));

        var userId = new Guid(Base64UrlTextEncoder.Decode(userHeader));

        var idClaim = new Claim(ClaimTypes.NameIdentifier, userId.ToString("n"));
        Request.HttpContext.User = new(new ClaimsIdentity([idClaim], Scheme.Name));
        var ticket = new AuthenticationTicket(Request.HttpContext.User, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private static bool IsValidUserId(string userId) => !string.IsNullOrWhiteSpace(userId) && ValidUserId().IsMatch(userId);

    [GeneratedRegex("^[a-zA-Z0-9]+$")]
    private static partial Regex ValidUserId();
}