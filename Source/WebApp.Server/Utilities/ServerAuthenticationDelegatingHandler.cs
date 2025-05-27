namespace VttTools.WebApp.Utilities;

public class ServerAuthenticationDelegatingHandler(IHttpContextAccessor contextAccessor)
    : DelegatingHandler {
    private const string _userHeader = "x-user";

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) {
        request.Headers.Remove(_userHeader);
        var user = contextAccessor.HttpContext!.User;
        if (user.Identity?.IsAuthenticated != true)
            return await base.SendAsync(request, cancellationToken);

        var userId = user.GetUserId();
        if (userId == Guid.Empty)
            return await base.SendAsync(request, cancellationToken);
        var token = Base64UrlEncoder.Encode(userId.ToByteArray());
        request.Headers.Add(_userHeader, token);
        return await base.SendAsync(request, cancellationToken);
    }
}
