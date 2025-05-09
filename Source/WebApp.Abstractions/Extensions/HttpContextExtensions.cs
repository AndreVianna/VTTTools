namespace VttTools.WebApp.Extensions;

public static class HttpContextExtensions {
    private const string _statusMessageCookieName = "Identity.StatusMessage";

    private static readonly CookieBuilder _statusCookieBuilder = new() {
        SameSite = SameSiteMode.Strict,
        HttpOnly = true,
        IsEssential = true,
        MaxAge = TimeSpan.FromSeconds(5),
    };

    public static void SetStatusMessage(this HttpContext context, string message)
        => context.Response.Cookies.Append(_statusMessageCookieName, message, _statusCookieBuilder.Build(context));

    public static string? GetStatusMessage(this HttpContext context) {
        var message = context.Request.Cookies[_statusMessageCookieName];

        if (message is not null)
            context.Response.Cookies.Delete(_statusMessageCookieName);

        return message;
    }
}