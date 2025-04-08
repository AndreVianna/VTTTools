namespace WebApp.Components.Account;

internal sealed class IdentityUserAccessor(IHttpClientFactory clientFactory, IdentityRedirectManager redirectManager) {
    public async Task<User?> GetRequiredUserAsync(HttpContext context, CancellationToken ct) {
        var id = context.User.Identity?.Name;
        if (id is null) {
            redirectManager.RedirectToWithStatus("Account/InvalidUser", "Error: Unable to load user.", context);
            return null;
        }

        var user = await GetUserByIdAsync(id, ct);
        if (user is null) {
            redirectManager.RedirectToWithStatus("Account/InvalidUser", $"Error: Unable to load user '{id}'.", context);
            return null;
        }

        return user;
    }

    private static readonly CompositeFormat _userUri = CompositeFormat.Parse("/users/{0}");

    private async Task<User?> GetUserByIdAsync(string? id, CancellationToken ct) {
        var client = clientFactory.CreateClient("IdentityService");
        var response = await client.GetFromJsonAsync<FindUserResponse>(string.Format(null, _userUri, id), ct);
        return response is null
            ? null
            : new User {
                Id = response.Id,
                Identifier = response.Identifier,
                Email = response.Email,
                PhoneNumber = response.PhoneNumber,
            };
    }
}
