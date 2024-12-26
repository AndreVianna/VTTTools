namespace WebApp.Components.Account;

internal sealed class IdentityUserAccessor(IHttpClientFactory clientFactory, IdentityRedirectManager redirectManager) {
    public async Task<User> GetRequiredUserAsync(HttpContext context, CancellationToken ct) {
        var id = context.User.Identity?.Name;
        if (id is null) {
            redirectManager.RedirectToWithStatus("Account/InvalidUser", $"Error: Unable to load user '{id ?? "[Unknown]"}'.", context);
            return null!;
        }

        var user = await GetUserAsync(id, ct);
        if (user is null) {
            redirectManager.RedirectToWithStatus("Account/InvalidUser", $"Error: Unable to load user '{id ?? "[Unknown]"}'.", context);
            return null!;
        }

        return user!;
    }

    private static readonly CompositeFormat _userUri = CompositeFormat.Parse("/users/{0}");

    private async Task<User?> GetUserAsync(string? id, CancellationToken ct) {
        var client = clientFactory.CreateClient("AuthService");
        var response = await client.GetFromJsonAsync<FindUserResponse>(string.Format(null, _userUri, id), ct);
        if (response is null) return null;
        return new User {
            Id = response.Id,
            Email = response.Email,
            Name = response.Name,
            PreferredName = response.PreferredName,
            PhoneNumber = response.PhoneNumber,
            EmailConfirmed = response.EmailConfirmed,
            PhoneNumberConfirmed = response.PhoneNumberConfirmed,
            TwoFactorEnabled = response.TwoFactorEnabled,
            LockoutEnabled = response.LockoutEnabled,
            LockoutEnd = response.LockoutEnd,
            AccessFailedCount = response.AccessFailedCount,
        };
    }
}
