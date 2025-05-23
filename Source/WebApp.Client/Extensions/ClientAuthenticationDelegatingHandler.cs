using Microsoft.AspNetCore.Components.Authorization;

namespace VttTools.WebApp.Client.Extensions;

public class ClientAuthenticationDelegatingHandler(AuthenticationStateProvider authenticationStateProvider)
    : DelegatingHandler {
    private const string _userHeader = "x-user";

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) {
        request.Headers.Remove(_userHeader);
        var authState = await authenticationStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;
        if (user.Identity?.IsAuthenticated != true)
            return await base.SendAsync(request, cancellationToken);

        var userId = user.GetCurrentUserId();
        if (userId == Guid.Empty)
            return await base.SendAsync(request, cancellationToken);
        var token = Base64UrlEncoder.Encode(userId.ToByteArray());
        request.Headers.Add(_userHeader, token);
        return await base.SendAsync(request, cancellationToken);
    }
}
